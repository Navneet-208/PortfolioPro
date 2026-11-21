from django.contrib import admin
from .models import FundamentalReport, TechnicalIndicatorCache

@admin.register(FundamentalReport)
class FundamentalReportAdmin(admin.ModelAdmin):
    list_display = ('stock', 'fiscal_year', 'revenue', 'net_income', 'roe', 'profit_margin', 'updated_at')
    search_fields = ('stock__symbol', 'stock__company_name')


@admin.register(TechnicalIndicatorCache)
class TechnicalIndicatorCacheAdmin(admin.ModelAdmin):
    list_display = ('stock', 'indicator_name', 'value', 'signal', 'calculated_at')
    list_filter = ('indicator_name', 'signal')
    search_fields = ('stock__symbol',)
