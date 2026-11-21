from rest_framework import serializers
from .models import FundamentalReport, TechnicalIndicatorCache
from stocks.serializers import StockSerializer

class FundamentalReportSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)
    stock_name = serializers.CharField(source='stock.company_name', read_only=True)

    class Meta:
        model = FundamentalReport
        fields = [
            'id', 'stock', 'stock_symbol', 'stock_name', 'fiscal_year',
            'revenue', 'net_income', 'total_assets', 'total_debt',
            'operating_cash_flow', 'roe', 'debt_to_equity', 'profit_margin',
            'quick_ratio', 'summary', 'updated_at'
        ]


class TechnicalIndicatorCacheSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source='stock.symbol', read_only=True)

    class Meta:
        model = TechnicalIndicatorCache
        fields = ['id', 'stock', 'stock_symbol', 'indicator_name', 'value', 'signal', 'calculated_at']
