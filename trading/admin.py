from django.contrib import admin
from .models import Order, TradeExecution

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'stock', 'order_type', 'side', 'quantity', 'price', 'status', 'created_at')
    list_filter = ('status', 'side', 'order_type')
    search_fields = ('user__username', 'stock__symbol')


@admin.register(TradeExecution)
class TradeExecutionAdmin(admin.ModelAdmin):
    list_display = ('execution_id', 'user', 'stock', 'side', 'shares', 'price', 'total_value', 'executed_at')
    list_filter = ('side',)
    search_fields = ('execution_id', 'user__username', 'stock__symbol')
