from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import calculate_or_get_risk_metrics, all_risk_overview, RiskLimitViewSet

router = DefaultRouter()
router.register(r'limits', RiskLimitViewSet, basename='risk-limit')

urlpatterns = [
    path('metrics/', calculate_or_get_risk_metrics, name='risk_metrics'),
    path('audit/', all_risk_overview, name='risk_audit'),
    path('', include(router.urls)),
]
