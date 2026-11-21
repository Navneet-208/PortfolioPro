from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, TradeExecutionViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'executions', TradeExecutionViewSet, basename='trade-execution')

urlpatterns = [
    path('', include(router.urls)),
]
