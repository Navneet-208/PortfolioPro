from django.db import models
from django.contrib.auth.models import User

class Stock(models.Model):
    EXCHANGE_CHOICES = (
        ('NASDAQ', 'NASDAQ'),
        ('NYSE', 'New York Stock Exchange'),
        ('BATS', 'BATS Global Markets'),
    )

    symbol = models.CharField(max_length=10, unique=True, db_index=True)
    company_name = models.CharField(max_length=150)
    sector = models.CharField(max_length=100, db_index=True)
    industry = models.CharField(max_length=100)
    exchange = models.CharField(max_length=50, choices=EXCHANGE_CHOICES, default='NASDAQ')
    current_price = models.DecimalField(max_digits=10, decimal_places=2)
    previous_close = models.DecimalField(max_digits=10, decimal_places=2)
    change = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    change_percent = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)
    day_high = models.DecimalField(max_digits=10, decimal_places=2)
    day_low = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.BigIntegerField(default=0)
    market_cap = models.BigIntegerField(default=0)
    pe_ratio = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    eps = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    dividend_yield = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    beta = models.DecimalField(max_digits=5, decimal_places=2, default=1.00)
    fifty_two_week_high = models.DecimalField(max_digits=10, decimal_places=2)
    fifty_two_week_low = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.current_price and self.previous_close:
            self.change = self.current_price - self.previous_close
            if self.previous_close > 0:
                self.change_percent = (self.change / self.previous_close) * 100
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.symbol} - {self.company_name} (${self.current_price})"


class StockPriceHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='price_history')
    date = models.DateField(db_index=True)
    open_price = models.DecimalField(max_digits=10, decimal_places=2)
    high_price = models.DecimalField(max_digits=10, decimal_places=2)
    low_price = models.DecimalField(max_digits=10, decimal_places=2)
    close_price = models.DecimalField(max_digits=10, decimal_places=2)
    volume = models.BigIntegerField()

    class Meta:
        ordering = ['date']
        unique_together = ('stock', 'date')

    def __str__(self):
        return f"{self.stock.symbol} ({self.date}): Open ${self.open_price}, Close ${self.close_price}"


class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watchlists')
    name = models.CharField(max_length=100, default='My Watchlist')
    stocks = models.ManyToManyField(Stock, related_name='in_watchlists', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
