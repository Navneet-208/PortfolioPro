from django.contrib import admin
from .models import PortfolioHolding, PortfolioSnapshot

@admin.register(PortfolioHolding)
class PortfolioHoldingAdmin(admin.ModelAdmin):
    list_display = ('user', 'account', 'stock', 'shares', 'average_buy_price', 'total_cost', 'updated_at')
    search_fields = ('user__username', 'stock__symbol', 'stock__company_name')
    list_filter = ('stock__sector',)


@admin.register(PortfolioSnapshot)
class PortfolioSnapshotAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_equity', 'cash_balance', 'invested_value', 'unrealized_pnl', 'recorded_at')
    search_fields = ('user__username',)
