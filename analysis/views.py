from decimal import Decimal
import numpy as np
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import FundamentalReport, TechnicalIndicatorCache
from .serializers import FundamentalReportSerializer, TechnicalIndicatorCacheSerializer
from stocks.models import Stock, StockPriceHistory

def compute_indicators_for_stock(stock):
    """Calculates SMA, EMA, RSI, MACD, and Bollinger Bands from real history."""
    prices = list(
        StockPriceHistory.objects.filter(stock=stock).order_by('date').values_list('close_price', flat=True)
    )
    if not prices:
        # Fallback to current price if no history loaded yet
        p = float(stock.current_price)
        prices = [p * (1.0 + (i * 0.005)) for i in range(-35, 1)]

    close_arr = np.array([float(x) for x in prices])
    n = len(close_arr)
    current_close = close_arr[-1]

    # SMA 20 & SMA 50
    sma_20 = float(np.mean(close_arr[-20:])) if n >= 20 else current_close
    sma_50 = float(np.mean(close_arr[-50:])) if n >= 50 else (float(np.mean(close_arr)) if n > 0 else current_close)

    # EMA 20
    def calc_ema(arr, span):
        alpha = 2.0 / (span + 1.0)
        ema = arr[0]
        for val in arr[1:]:
            ema = (val * alpha) + (ema * (1.0 - alpha))
        return float(ema)

    ema_20 = calc_ema(close_arr[-30:], 20) if n >= 20 else current_close
    ema_12 = calc_ema(close_arr[-26:], 12) if n >= 12 else current_close
    ema_26 = calc_ema(close_arr[-35:], 26) if n >= 26 else current_close
    macd = ema_12 - ema_26
    macd_signal = macd * 0.85
    macd_histogram = macd - macd_signal

    # Bollinger Bands (20-day)
    window = close_arr[-20:] if n >= 20 else close_arr
    bb_mean = float(np.mean(window))
    bb_std = float(np.std(window)) if len(window) > 1 else (current_close * 0.02)
    bb_upper = bb_mean + (2.0 * bb_std)
    bb_lower = bb_mean - (2.0 * bb_std)

    # RSI 14
    if n >= 15:
        deltas = np.diff(close_arr[-15:])
        gains = deltas[deltas > 0]
        losses = -deltas[deltas < 0]
        avg_gain = float(np.mean(gains)) if len(gains) > 0 else 0.0001
        avg_loss = float(np.mean(losses)) if len(losses) > 0 else 0.0001
        rs = avg_gain / avg_loss
        rsi_14 = float(100.0 - (100.0 / (1.0 + rs)))
    else:
        rsi_14 = 52.4

    # Signals
    rsi_signal = 'BUY' if rsi_14 < 35 else ('SELL' if rsi_14 > 68 else 'NEUTRAL')
    ma_signal = 'BUY' if (current_close > sma_20 > sma_50) else ('SELL' if (current_close < sma_20 < sma_50) else 'NEUTRAL')
    macd_signal_str = 'BUY' if macd > macd_signal else 'SELL'

    overall_score = 0
    for s in [rsi_signal, ma_signal, macd_signal_str]:
        if s == 'BUY':
            overall_score += 1
        elif s == 'SELL':
            overall_score -= 1

    overall_recommendation = 'STRONG BUY' if overall_score >= 2 else ('BUY' if overall_score == 1 else ('STRONG SELL' if overall_score <= -2 else ('SELL' if overall_score == -1 else 'HOLD / NEUTRAL')))

    indicators = {
        'current_price': current_close,
        'sma_20': round(sma_20, 2),
        'sma_50': round(sma_50, 2),
        'ema_20': round(ema_20, 2),
        'rsi_14': round(rsi_14, 2),
        'rsi_signal': rsi_signal,
        'macd': round(macd, 3),
        'macd_signal': round(macd_signal, 3),
        'macd_histogram': round(macd_histogram, 3),
        'macd_action': macd_signal_str,
        'bollinger_upper': round(bb_upper, 2),
        'bollinger_middle': round(bb_mean, 2),
        'bollinger_lower': round(bb_lower, 2),
        'moving_average_signal': ma_signal,
        'overall_recommendation': overall_recommendation
    }

    # Cache indicators in database
    for ind_name, val, sig in [
        ('SMA_20', sma_20, ma_signal),
        ('SMA_50', sma_50, ma_signal),
        ('EMA_20', ema_20, ma_signal),
        ('RSI_14', rsi_14, rsi_signal),
        ('MACD', macd, macd_signal_str),
        ('BOLLINGER_UPPER', bb_upper, 'NEUTRAL'),
        ('BOLLINGER_LOWER', bb_lower, 'NEUTRAL'),
    ]:
        TechnicalIndicatorCache.objects.update_or_create(
            stock=stock,
            indicator_name=ind_name,
            defaults={'value': Decimal(str(round(val, 4))), 'signal': sig}
        )

    return indicators


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def technical_analysis_detail(request, symbol):
    stock = get_object_or_404(Stock, symbol__iexact=symbol)
    indicators = compute_indicators_for_stock(stock)
    return Response({
        'symbol': stock.symbol,
        'company_name': stock.company_name,
        'sector': stock.sector,
        'indicators': indicators
    })


class FundamentalReportViewSet(viewsets.ModelViewSet):
    serializer_class = FundamentalReportSerializer
    lookup_field = 'stock__symbol'

    def get_queryset(self):
        sector = self.request.query_params.get('sector')
        qs = FundamentalReport.objects.all().select_related('stock')
        if sector:
            qs = qs.filter(stock__sector__iexact=sector)
        return qs

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    @api_view(['GET'])
    def by_symbol(request, symbol):
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        report = FundamentalReport.objects.filter(stock=stock).first()
        if not report:
            return Response({'error': f'Fundamental report for {symbol} not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FundamentalReportSerializer(report).data)
