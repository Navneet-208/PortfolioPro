from django.db import models
from stocks.models import Stock

class FundamentalReport(models.Model):
    stock = models.OneToOneField(Stock, on_delete=models.CASCADE, related_name='fundamental_report')
    fiscal_year = models.IntegerField(default=2025)
    revenue = models.BigIntegerField(help_text="Annual revenue in USD")
    net_income = models.BigIntegerField(help_text="Net income in USD")
    total_assets = models.BigIntegerField(help_text="Total assets in USD")
    total_debt = models.BigIntegerField(help_text="Total debt in USD")
    operating_cash_flow = models.BigIntegerField(help_text="Cash flow from operations in USD")
    roe = models.DecimalField(max_digits=6, decimal_places=2, help_text="Return on Equity %")
    debt_to_equity = models.DecimalField(max_digits=6, decimal_places=2)
    profit_margin = models.DecimalField(max_digits=6, decimal_places=2, help_text="Net profit margin %")
    quick_ratio = models.DecimalField(max_digits=6, decimal_places=2, default=1.20)
    summary = models.TextField(help_text="Business overview and valuation commentary")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Fundamental Analysis: {self.stock.symbol} ({self.fiscal_year})"


class TechnicalIndicatorCache(models.Model):
    SIGNAL_CHOICES = (
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
        ('NEUTRAL', 'Neutral'),
    )

    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='technical_indicators')
    indicator_name = models.CharField(max_length=50)  # SMA_20, SMA_50, EMA_20, RSI_14, MACD, BOLLINGER_UPPER, BOLLINGER_LOWER
    value = models.DecimalField(max_digits=12, decimal_places=4)
    signal = models.CharField(max_length=20, choices=SIGNAL_CHOICES, default='NEUTRAL')
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('stock', 'indicator_name')

    def __str__(self):
        return f"{self.stock.symbol} - {self.indicator_name}: {self.value} ({self.signal})"
