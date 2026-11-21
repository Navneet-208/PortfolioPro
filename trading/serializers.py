from rest_framework import serializers
from .models import Order, TradeExecution
from stocks.models import Stock
from stocks.serializers import StockSerializer

class TradeExecutionSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.company_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = TradeExecution
        fields = [
            'id', 'execution_id', 'user', 'username', 'stock', 'stock_symbol',
            'stock_name', 'side', 'shares', 'price', 'total_value',
            'commission', 'executed_at'
        ]


class OrderSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.company_name', read_only=True)
    stock_current_price = serializers.DecimalField(source='stock.current_price', max_digits=10, decimal_places=2, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    execution = TradeExecutionSerializer(read_only=True)

    symbol = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'username', 'account', 'stock', 'symbol',
            'stock_symbol', 'stock_name', 'stock_current_price',
            'order_type', 'side', 'quantity', 'price', 'status',
            'executed_price', 'executed_at', 'notes', 'created_at', 'execution'
        ]
        read_only_fields = ['user', 'account', 'stock', 'status', 'executed_price', 'executed_at', 'created_at']
