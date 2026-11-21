from rest_framework import serializers
from .models import RiskMetric, RiskLimit

class RiskMetricSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = RiskMetric
        fields = [
            'id', 'user', 'username', 'portfolio_beta', 'value_at_risk_95',
            'sharpe_ratio', 'volatility', 'max_drawdown', 'risk_score', 'calculated_at'
        ]
        read_only_fields = ['user', 'calculated_at']


class RiskLimitSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = RiskLimit
        fields = [
            'id', 'user', 'username', 'max_position_size_pct',
            'stop_loss_alert_pct', 'daily_loss_limit', 'is_active', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
