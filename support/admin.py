from django.contrib import admin
from .models import SupportTicket, TicketMessage

class TicketMessageInline(admin.TabularInline):
    model = TicketMessage
    extra = 1

@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'user', 'subject', 'category', 'priority', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'priority', 'category')
    search_fields = ('ticket_number', 'user__username', 'subject')
    inlines = [TicketMessageInline]


@admin.register(TicketMessage)
class TicketMessageAdmin(admin.ModelAdmin):
    list_display = ('ticket', 'sender', 'is_staff_reply', 'created_at')
    list_filter = ('is_staff_reply',)
    search_fields = ('ticket__ticket_number', 'sender__username', 'message')
