from decimal import Decimal
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import PortfolioHolding, PortfolioSnapshot
from .serializers import PortfolioHoldingSerializer, PortfolioSnapshotSerializer
from accounts.models import TradingAccount

class PortfolioHoldingViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PortfolioHoldingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            user_id = self.request.query_params.get('user_id')
            if user_id:
                return PortfolioHolding.objects.filter(user_id=user_id, shares__gt=0).select_related('stock', 'account', 'user')
            return PortfolioHolding.objects.filter(shares__gt=0).select_related('stock', 'account', 'user')
        return PortfolioHolding.objects.filter(user=user, shares__gt=0).select_related('stock', 'account')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def portfolio_summary(request):
    user = request.user
    # Finance officer can view summary for a specific user via query param ?user_id=X
    if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
        target_user_id = request.query_params.get('user_id')
        if target_user_id:
            from django.contrib.auth.models import User
            target_user = User.objects.filter(id=target_user_id).first()
            if target_user:
                user = target_user

    account = TradingAccount.objects.filter(user=user, status='ACTIVE').first()
    cash_balance = account.balance if account else Decimal('0.00')

    holdings = PortfolioHolding.objects.filter(user=user, shares__gt=0).select_related('stock')

    invested_value = Decimal('0.00')
    total_cost = Decimal('0.00')
    sector_allocations = {}

    holdings_data = []
    for h in holdings:
        cur_val = Decimal(str(h.shares)) * h.stock.current_price
        invested_value += cur_val
        total_cost += h.total_cost

        sector = h.stock.sector or 'Other'
        sector_allocations[sector] = sector_allocations.get(sector, Decimal('0.00')) + cur_val

        holdings_data.append({
            'id': h.id,
            'symbol': h.stock.symbol,
            'company_name': h.stock.company_name,
            'sector': sector,
            'shares': h.shares,
            'average_buy_price': str(h.average_buy_price),
            'current_price': str(h.stock.current_price),
            'total_cost': str(h.total_cost),
            'current_value': str(cur_val),
            'unrealized_pnl': str(cur_val - h.total_cost),
            'return_percentage': round(float(((cur_val - h.total_cost) / h.total_cost) * 100), 2) if h.total_cost > 0 else 0.0
        })

    total_equity = cash_balance + invested_value
    unrealized_pnl = invested_value - total_cost
    return_percentage = round(float((unrealized_pnl / total_cost) * 100), 2) if total_cost > 0 else 0.0

    # Sector breakdown formatting with percentages
    sector_chart = []
    for sector, val in sector_allocations.items():
        pct = round(float((val / total_equity) * 100), 2) if total_equity > 0 else 0.0
        sector_chart.append({
            'sector': sector,
            'value': float(val),
            'percentage': pct
        })

    # Cash percentage
    if total_equity > 0:
        cash_pct = round(float((cash_balance / total_equity) * 100), 2)
        sector_chart.append({
            'sector': 'Cash / Liquidity',
            'value': float(cash_balance),
            'percentage': cash_pct
        })

    # Get recent performance snapshots
    snapshots = PortfolioSnapshot.objects.filter(user=user).order_by('recorded_at')[:30]
    snapshot_serializer = PortfolioSnapshotSerializer(snapshots, many=True)

    return Response({
        'user_id': user.id,
        'username': user.username,
        'account_number': account.account_number if account else None,
        'total_equity': str(total_equity),
        'cash_balance': str(cash_balance),
        'invested_value': str(invested_value),
        'total_cost': str(total_cost),
        'unrealized_pnl': str(unrealized_pnl),
        'return_percentage': return_percentage,
        'holdings_count': len(holdings_data),
        'holdings': holdings_data,
        'sector_allocations': sector_chart,
        'performance_history': snapshot_serializer.data
    })


class PortfolioSnapshotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PortfolioSnapshotSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            return PortfolioSnapshot.objects.all().select_related('user')
        return PortfolioSnapshot.objects.filter(user=user)
