from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NotificationViewSet, PriceAlertViewSet

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'alerts', PriceAlertViewSet, basename='price-alert')

urlpatterns = [
    path('', include(router.urls)),
]
