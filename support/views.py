import uuid
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import SupportTicket, TicketMessage
from .serializers import SupportTicketSerializer, TicketMessageSerializer

class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'ticket_number'

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            qs = SupportTicket.objects.all().select_related('user').prefetch_related('messages')
        else:
            qs = SupportTicket.objects.filter(user=user).prefetch_related('messages')

        status_param = self.request.query_params.get('status')
        priority_param = self.request.query_params.get('priority')
        category_param = self.request.query_params.get('category')

        if status_param:
            qs = qs.filter(status=status_param)
        if priority_param:
            qs = qs.filter(priority=priority_param)
        if category_param:
            qs = qs.filter(category=category_param)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        ticket_number = f"TKT-{uuid.uuid4().hex[:8].upper()}"
        serializer.save(user=user, ticket_number=ticket_number)

    @action(detail=True, methods=['post'])
    def add_message(self, request, ticket_number=None):
        ticket = self.get_object()
        user = request.user
        message_text = request.data.get('message')
        if not message_text:
            return Response({'error': 'Message text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER'
        msg = TicketMessage.objects.create(
            ticket=ticket,
            sender=user,
            message=message_text,
            is_staff_reply=is_staff
        )

        # Update status if staff replied
        if is_staff and ticket.status == 'OPEN':
            ticket.status = 'IN_PROGRESS'
            ticket.save()

        return Response(TicketMessageSerializer(msg).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, ticket_number=None):
        ticket = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        ticket.status = new_status
        ticket.save()
        return Response(SupportTicketSerializer(ticket).data)
