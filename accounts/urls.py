from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    register_api,
    login_api,
    logout_api,
    current_user_profile,
    all_users_list,
    TradingAccountViewSet,
    AccountTransactionViewSet
)

router = DefaultRouter()
router.register(r'accounts', TradingAccountViewSet, basename='trading-account')
router.register(r'transactions', AccountTransactionViewSet, basename='account-transaction')

urlpatterns = [
    path('auth/register/', register_api, name='api_register'),
    path('auth/login/', login_api, name='api_login'),
    path('auth/logout/', logout_api, name='api_logout'),
    path('auth/profile/', current_user_profile, name='api_profile'),
    path('auth/users/', all_users_list, name='api_all_users'),
    path('', include(router.urls)),
]
