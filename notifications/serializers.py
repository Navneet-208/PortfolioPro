from rest_framework import serializers
from .models import Notification, PriceAlert
from stocks.serializers import StockSerializer
from stocks.models import Stock

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'title', 'message', 'notification_type', 'is_read', 'created_at']
        read_only_fields = ['user', 'created_at']


class PriceAlertSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    symbol = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = PriceAlert
        fields = ['id', 'user', 'stock', 'stock_symbol', 'symbol', 'target_price', 'condition', 'is_triggered', 'created_at']
        read_only_fields = ['user', 'is_triggered', 'created_at']

    def create(self, validated_data):
        symbol = validated_data.pop('symbol', None)
        if symbol:
            stock = Stock.objects.get(symbol__iexact=symbol)
            validated_data['stock'] = stock
        return super().create(validated_data)
