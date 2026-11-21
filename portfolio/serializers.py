from rest_framework import serializers
from .models import PortfolioHolding, PortfolioSnapshot
from stocks.serializers import StockSerializer

class PortfolioHoldingSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.company_name', read_only=True)
    sector = serializers.CharField(source='stock.sector', read_only=True)
    current_price = serializers.DecimalField(source='stock.current_price', max_digits=10, decimal_places=2, read_only=True)
    current_value = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)
    unrealized_pnl = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    return_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = PortfolioHolding
        fields = [
            'id', 'user', 'account', 'stock', 'stock_symbol', 'stock_name', 'sector',
            'shares', 'average_buy_price', 'total_cost', 'current_price',
            'current_value', 'unrealized_pnl', 'return_percentage',
            'created_at', 'updated_at'
        ]


class PortfolioSnapshotSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = PortfolioSnapshot
        fields = [
            'id', 'user', 'username', 'total_equity', 'cash_balance',
            'invested_value', 'unrealized_pnl', 'realized_pnl', 'recorded_at'
        ]
