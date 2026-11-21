from django.contrib import admin
from .models import UserProfile, TradingAccount, AccountTransaction

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone_number', 'kyc_status', 'risk_tolerance', 'created_at')
    list_filter = ('role', 'kyc_status', 'risk_tolerance')
    search_fields = ('user__username', 'user__email', 'phone_number')


@admin.register(TradingAccount)
class TradingAccountAdmin(admin.ModelAdmin):
    list_display = ('account_number', 'user', 'account_type', 'balance', 'currency', 'status', 'created_at')
    list_filter = ('account_type', 'status', 'currency')
    search_fields = ('account_number', 'user__username')


@admin.register(AccountTransaction)
class AccountTransactionAdmin(admin.ModelAdmin):
    list_display = ('account', 'transaction_type', 'amount', 'status', 'created_at')
    list_filter = ('transaction_type', 'status')
    search_fields = ('account__account_number', 'description')
