from django.contrib import admin
from .models import Notification, PriceAlert

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'notification_type', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read')
    search_fields = ('user__username', 'title')


@admin.register(PriceAlert)
class PriceAlertAdmin(admin.ModelAdmin):
    list_display = ('user', 'stock', 'target_price', 'condition', 'is_triggered', 'created_at')
    list_filter = ('condition', 'is_triggered')
    search_fields = ('user__username', 'stock__symbol')
