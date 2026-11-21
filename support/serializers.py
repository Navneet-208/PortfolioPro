from rest_framework import serializers
from .models import SupportTicket, TicketMessage

class TicketMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_name', 'message', 'is_staff_reply', 'created_at']
        read_only_fields = ['ticket', 'sender', 'sender_name', 'is_staff_reply', 'created_at']


class SupportTicketSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    messages = TicketMessageSerializer(many=True, read_only=True)
    initial_message = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'user', 'username', 'subject',
            'category', 'priority', 'status', 'created_at', 'updated_at',
            'messages', 'initial_message'
        ]
        read_only_fields = ['ticket_number', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        initial_message = validated_data.pop('initial_message', None)
        ticket = super().create(validated_data)
        if initial_message:
            TicketMessage.objects.create(
                ticket=ticket,
                sender=ticket.user,
                message=initial_message,
                is_staff_reply=False
            )
        return ticket
