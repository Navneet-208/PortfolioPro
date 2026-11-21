from decimal import Decimal
import math
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import RiskMetric, RiskLimit
from .serializers import RiskMetricSerializer, RiskLimitSerializer
from portfolio.models import PortfolioHolding
from accounts.models import TradingAccount

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def calculate_or_get_risk_metrics(request):
    user = request.user
    if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
        user_id = request.query_params.get('user_id')
        if user_id:
            from django.contrib.auth.models import User
            target = User.objects.filter(id=user_id).first()
            if target:
                user = target

    holdings = PortfolioHolding.objects.filter(user=user, shares__gt=0).select_related('stock')
    account = TradingAccount.objects.filter(user=user, status='ACTIVE').first()
    cash = account.balance if account else Decimal('0.00')

    invested_value = sum(Decimal(str(h.shares)) * h.stock.current_price for h in holdings)
    total_equity = cash + invested_value

    # Default baseline parameters
    if not holdings or invested_value == 0:
        beta = Decimal('1.00')
        volatility = Decimal('12.00')
        var_95 = Decimal('0.00')
        sharpe = Decimal('1.50')
        max_dd = Decimal('5.00')
        score = 30
    else:
        # Calculate weighted beta
        weighted_beta = Decimal('0.00')
        for h in holdings:
            val = Decimal(str(h.shares)) * h.stock.current_price
            weight = val / invested_value
            weighted_beta += weight * h.stock.beta
        beta = round(weighted_beta, 2)

        # Volatility estimation based on beta
        volatility = round(Decimal('12.00') * beta, 2)

        # 1-day 95% Parametric VaR = 1.645 * (volatility / 100 / sqrt(252)) * invested_value
        daily_vol = (volatility / Decimal('100.0')) / Decimal(str(math.sqrt(252)))
        var_95 = round(Decimal('1.645') * daily_vol * invested_value, 2)

        # Sharpe ratio = (Annual Return - Risk Free Rate (4.5%)) / Volatility
        annual_return = Decimal('14.2')
        risk_free = Decimal('4.5')
        sharpe = round((annual_return - risk_free) / volatility if volatility > 0 else Decimal('1.5'), 2)

        max_dd = round(Decimal('8.50') * beta, 2)

        # Risk score calculation (1 - 100)
        raw_score = int(float(beta) * 35 + float(volatility) * 1.5)
        score = max(10, min(95, raw_score))

    metric, _ = RiskMetric.objects.update_or_create(
        user=user,
        defaults={
            'portfolio_beta': beta,
            'value_at_risk_95': var_95,
            'sharpe_ratio': sharpe,
            'volatility': volatility,
            'max_drawdown': max_dd,
            'risk_score': score,
        }
    )

    # Stress Test Scenarios
    stress_tests = [
        {
            'scenario': '2008 Financial Crisis Repeat (-25% Market)',
            'portfolio_impact_pct': -round(float(beta) * 25.0, 2),
            'estimated_loss_usd': round(float(invested_value) * (float(beta) * 0.25), 2),
            'severity': 'HIGH'
        },
        {
            'scenario': 'Tech Sector Correction (-15% Tech)',
            'portfolio_impact_pct': -round(float(beta) * 15.0, 2),
            'estimated_loss_usd': round(float(invested_value) * (float(beta) * 0.15), 2),
            'severity': 'MEDIUM'
        },
        {
            'scenario': 'Federal Reserve +100bps Rate Hike (-6% Broad Market)',
            'portfolio_impact_pct': -round(float(beta) * 6.0, 2),
            'estimated_loss_usd': round(float(invested_value) * (float(beta) * 0.06), 2),
            'severity': 'LOW'
        }
    ]

    return Response({
        'user_id': user.id,
        'username': user.username,
        'metrics': RiskMetricSerializer(metric).data,
        'stress_testing': stress_tests,
        'invested_capital': str(invested_value),
        'cash_reserve': str(cash),
        'liquidity_ratio_pct': round(float((cash / total_equity) * 100), 2) if total_equity > 0 else 100.0
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def all_risk_overview(request):
    """Finance Officer view to audit risk across all portfolios."""
    if not (hasattr(request.user, 'profile') and request.user.profile.role == 'FINANCE_OFFICER'):
        return Response({'error': 'Unauthorized. Requires Finance Officer role.'}, status=status.HTTP_403_FORBIDDEN)

    metrics = RiskMetric.objects.all().select_related('user')
    status_filter = request.query_params.get('risk_level')  # 'HIGH', 'MEDIUM', 'LOW'

    results = []
    for m in metrics:
        level = 'HIGH' if m.risk_score >= 70 else ('MEDIUM' if m.risk_score >= 40 else 'LOW')
        if status_filter and status_filter.upper() != level:
            continue
        results.append({
            'user_id': m.user.id,
            'username': m.user.username,
            'risk_score': m.risk_score,
            'risk_level': level,
            'portfolio_beta': float(m.portfolio_beta),
            'value_at_risk_95': float(m.value_at_risk_95),
            'sharpe_ratio': float(m.sharpe_ratio),
            'volatility': float(m.volatility),
            'calculated_at': m.calculated_at
        })
    return Response(results)


class RiskLimitViewSet(viewsets.ModelViewSet):
    serializer_class = RiskLimitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            return RiskLimit.objects.all().select_related('user')
        return RiskLimit.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
