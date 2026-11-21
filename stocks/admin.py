from django.contrib import admin
from .models import Stock, StockPriceHistory, Watchlist

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('symbol', 'company_name', 'sector', 'exchange', 'current_price', 'change', 'change_percent', 'volume')
    search_fields = ('symbol', 'company_name', 'sector')
    list_filter = ('sector', 'exchange', 'is_active')


@admin.register(StockPriceHistory)
class StockPriceHistoryAdmin(admin.ModelAdmin):
    list_display = ('stock', 'date', 'open_price', 'high_price', 'low_price', 'close_price', 'volume')
    list_filter = ('stock__symbol', 'date')
    search_fields = ('stock__symbol',)


@admin.register(Watchlist)
class WatchlistAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username')
