from django.db import models
from django.contrib.auth.models import User

class RiskMetric(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='risk_metric')
    portfolio_beta = models.DecimalField(max_digits=6, decimal_places=2, default=1.05)
    value_at_risk_95 = models.DecimalField(max_digits=10, decimal_places=2, default=2450.00, help_text="1-day 95% VaR in USD")
    sharpe_ratio = models.DecimalField(max_digits=6, decimal_places=2, default=1.85)
    volatility = models.DecimalField(max_digits=6, decimal_places=2, default=14.50, help_text="Annualized volatility %")
    max_drawdown = models.DecimalField(max_digits=6, decimal_places=2, default=8.20, help_text="Max drawdown %")
    risk_score = models.IntegerField(default=45, help_text="Score 1-100 (1=conservative, 100=extreme)")
    calculated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Risk for {self.user.username}: Beta {self.portfolio_beta}, VaR ${self.value_at_risk_95}"


class RiskLimit(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='risk_limits')
    max_position_size_pct = models.DecimalField(max_digits=5, decimal_places=2, default=25.00)
    stop_loss_alert_pct = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    daily_loss_limit = models.DecimalField(max_digits=12, decimal_places=2, default=5000.00)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Limits for {self.user.username}: Max Pos {self.max_position_size_pct}%"
