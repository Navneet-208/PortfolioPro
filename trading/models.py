from django.db import models
from django.contrib.auth.models import User
from accounts.models import TradingAccount
from stocks.models import Stock

class Order(models.Model):
    ORDER_TYPE_CHOICES = (
        ('MARKET', 'Market Order'),
        ('LIMIT', 'Limit Order'),
        ('STOP_LOSS', 'Stop-Loss Order'),
    )
    SIDE_CHOICES = (
        ('BUY', 'Buy'),
        ('SELL', 'Sell'),
    )
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('EXECUTED', 'Executed'),
        ('CANCELLED', 'Cancelled'),
        ('REJECTED', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    account = models.ForeignKey(TradingAccount, on_delete=models.CASCADE, related_name='orders')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='orders')
    order_type = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='MARKET')
    side = models.CharField(max_length=10, choices=SIDE_CHOICES)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Order price (or limit price)")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    executed_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    executed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.side} {self.quantity} {self.stock.symbol} @ ${self.price} ({self.status})"


class TradeExecution(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='execution')
    execution_id = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='executions')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='executions')
    side = models.CharField(max_length=10, choices=Order.SIDE_CHOICES)
    shares = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    total_value = models.DecimalField(max_digits=12, decimal_places=2)
    commission = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-executed_at']

    def __str__(self):
        return f"Exec {self.execution_id}: {self.side} {self.shares} {self.stock.symbol} @ ${self.price}"
