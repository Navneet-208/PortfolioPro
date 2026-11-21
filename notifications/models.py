from django.db import models
from django.contrib.auth.models import User
from stocks.models import Stock

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('PRICE_ALERT', 'Price Alert'),
        ('ORDER_FILLED', 'Order Executed'),
        ('RISK_WARNING', 'Risk Warning'),
        ('SYSTEM_NOTICE', 'System Notice'),
        ('ACCOUNT_UPDATE', 'Account Update'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=150)
    message = models.TextField()
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default='SYSTEM_NOTICE')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title} (Read: {self.is_read})"


class PriceAlert(models.Model):
    CONDITION_CHOICES = (
        ('ABOVE', 'Price Crosses Above'),
        ('BELOW', 'Price Falls Below'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='price_alerts')
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name='price_alerts')
    target_price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=10, choices=CONDITION_CHOICES, default='ABOVE')
    is_triggered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.stock.symbol} {self.condition} ${self.target_price}"
