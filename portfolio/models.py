from django.db import models
from django.contrib.auth.models import User
from accounts.models import TradingAccount
from stocks.models import Stock

class PortfolioHolding(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='holdings')
    account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='holdings')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='holdings')
    shares = models.PositiveIntegerField(default=0)
    average_buy_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'account', 'stock')

    @property
    def current_value(self):
        return self.shares * self.stock.current_price

    @property
    def unrealized_pnl(self):
        return self.current_value - self.total_cost

    @property
    def return_percentage(self):
        if self.total_cost > 0:
            return ((self.current_value - self.total_cost) / self.total_cost) * 100
        return 0.0

    def __str__(self):
        return f"{self.user.username} - {self.shares} {self.stock.symbol} @ Avg ${self.average_buy_price}"


class PortfolioSnapshot(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='snapshots')
    total_equity = models.DecimalField(max_digits=14, decimal_places=2)
    cash_balance = models.DecimalField(max_digits=14, decimal_places=2)
    invested_value = models.DecimalField(max_digits=14, decimal_places=2)
    unrealized_pnl = models.DecimalField(max_digits=12, decimal_places=2)
    realized_pnl = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['recorded_at']

    def __str__(self):
        return f"{self.user.username} Snapshot on {self.recorded_at.strftime('%Y-%m-%d')}: Total ${self.total_equity:,.2f}"
