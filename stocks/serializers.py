from rest_framework import serializers
from .models import Stock, StockPriceHistory, Watchlist

class StockPriceHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockPriceHistory
        fields = ['id', 'stock', 'date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume']


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            'id', 'symbol', 'company_name', 'sector', 'industry', 'exchange',
            'current_price', 'previous_close', 'change', 'change_percent',
            'day_high', 'day_low', 'volume', 'market_cap', 'pe_ratio',
            'eps', 'dividend_yield', 'beta', 'fifty_two_week_high',
            'fifty_two_week_low', 'is_active', 'updated_at'
        ]


class WatchlistSerializer(serializers.ModelSerializer):
    stocks = StockSerializer(many=True, read_only=True)
    stock_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Stock.objects.all(), source='stocks', required=False
    )

    class Meta:
        model = Watchlist
        fields = ['id', 'user', 'name', 'stocks', 'stock_ids', 'created_at']
        read_only_fields = ['user', 'created_at']
