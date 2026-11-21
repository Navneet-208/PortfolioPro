from django.contrib import admin
from .models import RiskMetric, RiskLimit

@admin.register(RiskMetric)
class RiskMetricAdmin(admin.ModelAdmin):
    list_display = ('user', 'risk_score', 'portfolio_beta', 'value_at_risk_95', 'sharpe_ratio', 'volatility', 'calculated_at')
    search_fields = ('user__username',)


@admin.register(RiskLimit)
class RiskLimitAdmin(admin.ModelAdmin):
    list_display = ('user', 'max_position_size_pct', 'stop_loss_alert_pct', 'daily_loss_limit', 'is_active')
    search_fields = ('user__username',)
