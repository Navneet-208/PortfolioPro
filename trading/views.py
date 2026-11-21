import uuid
from decimal import Decimal
from django.utils import timezone
from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, TradeExecution
from .serializers import OrderSerializer, TradeExecutionSerializer
from accounts.models import TradingAccount, AccountTransaction
from stocks.models import Stock
from portfolio.models import PortfolioHolding
from notifications.models import Notification

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            qs = Order.objects.all().select_related('user', 'stock', 'account')
        else:
            qs = Order.objects.filter(user=user).select_related('stock', 'account')

        side = self.request.query_params.get('side')
        order_status = self.request.query_params.get('status')
        symbol = self.request.query_params.get('symbol')

        if side:
            qs = qs.filter(side=side)
        if order_status:
            qs = qs.filter(status=order_status)
        if symbol:
            qs = qs.filter(stock__symbol__iexact=symbol)
        return qs

    def create(self, request, *args, **kwargs):
        user = request.user
        account = TradingAccount.objects.filter(user=user, status='ACTIVE').first()
        if not account:
            return Response({'error': 'No active trading account found for user.'}, status=status.HTTP_400_BAD_REQUEST)

        symbol = request.data.get('symbol')
        stock_id = request.data.get('stock')
        if symbol:
            stock = Stock.objects.filter(symbol__iexact=symbol).first()
        elif stock_id:
            stock = Stock.objects.filter(id=stock_id).first()
        else:
            return Response({'error': 'Please provide stock symbol or stock ID.'}, status=status.HTTP_400_BAD_REQUEST)

        if not stock:
            return Response({'error': f'Stock symbol "{symbol}" not found.'}, status=status.HTTP_404_NOT_FOUND)

        order_type = request.data.get('order_type', 'MARKET')
        side = request.data.get('side', 'BUY').upper()
        try:
            quantity = int(request.data.get('quantity', 0))
            if quantity <= 0:
                raise ValueError()
        except ValueError:
            return Response({'error': 'Quantity must be a positive integer.'}, status=status.HTTP_400_BAD_REQUEST)

        # Price calculation
        if order_type == 'MARKET':
            exec_price = stock.current_price
            price = stock.current_price
        else:
            try:
                price = Decimal(str(request.data.get('price', stock.current_price)))
                exec_price = price
            except Exception:
                return Response({'error': 'Invalid price specified.'}, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            order = Order.objects.create(
                user=user,
                account=account,
                stock=stock,
                order_type=order_type,
                side=side,
                quantity=quantity,
                price=price,
                notes=request.data.get('notes', '')
            )

            total_trade_amount = Decimal(str(quantity)) * exec_price

            if side == 'BUY':
                if account.balance < total_trade_amount:
                    order.status = 'REJECTED'
                    order.notes = f'Insufficient account balance (${account.balance:,.2f}) for trade total (${total_trade_amount:,.2f})'
                    order.save()
                    return Response({
                        'error': 'Insufficient funds to execute order.',
                        'order': OrderSerializer(order).data
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Deduct balance
                account.balance -= total_trade_amount
                account.save()

                # Update or create holding
                holding, created = PortfolioHolding.objects.get_or_create(
                    user=user,
                    account=account,
                    stock=stock,
                    defaults={'shares': 0, 'average_buy_price': Decimal('0.00'), 'total_cost': Decimal('0.00')}
                )
                new_shares = holding.shares + quantity
                new_total_cost = holding.total_cost + total_trade_amount
                holding.shares = new_shares
                holding.total_cost = new_total_cost
                holding.average_buy_price = new_total_cost / Decimal(str(new_shares))
                holding.save()

                # Log transaction
                AccountTransaction.objects.create(
                    account=account,
                    transaction_type='TRADE_BUY',
                    amount=-total_trade_amount,
                    description=f"Bought {quantity} shares of {stock.symbol} @ ${exec_price:,.2f}",
                    status='COMPLETED'
                )

                # Execute order
                order.status = 'EXECUTED'
                order.executed_price = exec_price
                order.executed_at = timezone.now()
                order.save()

                # Record execution
                TradeExecution.objects.create(
                    order=order,
                    execution_id=f"EX-{uuid.uuid4().hex[:12].upper()}",
                    user=user,
                    stock=stock,
                    side='BUY',
                    shares=quantity,
                    price=exec_price,
                    total_value=total_trade_amount,
                    commission=Decimal('0.00')
                )

                Notification.objects.create(
                    user=user,
                    title="Order Executed (BUY)",
                    message=f"Successfully purchased {quantity} shares of {stock.symbol} at ${exec_price:,.2f}. Total: ${total_trade_amount:,.2f}",
                    notification_type='ORDER_FILLED'
                )

            elif side == 'SELL':
                holding = PortfolioHolding.objects.filter(user=user, account=account, stock=stock).first()
                if not holding or holding.shares < quantity:
                    available = holding.shares if holding else 0
                    order.status = 'REJECTED'
                    order.notes = f'Insufficient shares to sell. Available: {available}, requested: {quantity}'
                    order.save()
                    return Response({
                        'error': f'Insufficient shares ({available}) to sell {quantity}.',
                        'order': OrderSerializer(order).data
                    }, status=status.HTTP_400_BAD_REQUEST)

                # Add balance
                account.balance += total_trade_amount
                account.save()

                # Update holding
                holding.shares -= quantity
                if holding.shares == 0:
                    holding.delete()
                else:
                    holding.total_cost = Decimal(str(holding.shares)) * holding.average_buy_price
                    holding.save()

                # Log transaction
                AccountTransaction.objects.create(
                    account=account,
                    transaction_type='TRADE_SELL',
                    amount=total_trade_amount,
                    description=f"Sold {quantity} shares of {stock.symbol} @ ${exec_price:,.2f}",
                    status='COMPLETED'
                )

                # Execute order
                order.status = 'EXECUTED'
                order.executed_price = exec_price
                order.executed_at = timezone.now()
                order.save()

                # Record execution
                TradeExecution.objects.create(
                    order=order,
                    execution_id=f"EX-{uuid.uuid4().hex[:12].upper()}",
                    user=user,
                    stock=stock,
                    side='SELL',
                    shares=quantity,
                    price=exec_price,
                    total_value=total_trade_amount,
                    commission=Decimal('0.00')
                )

                Notification.objects.create(
                    user=user,
                    title="Order Executed (SELL)",
                    message=f"Successfully sold {quantity} shares of {stock.symbol} at ${exec_price:,.2f}. Total proceeds: ${total_trade_amount:,.2f}",
                    notification_type='ORDER_FILLED'
                )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status != 'PENDING':
            return Response({'error': f'Cannot cancel order with status {order.status}.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = 'CANCELLED'
        order.notes = f"Cancelled by user {request.user.username}"
        order.save()
        return Response({'message': 'Order successfully cancelled.', 'order': OrderSerializer(order).data})


class TradeExecutionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = TradeExecutionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'FINANCE_OFFICER':
            return TradeExecution.objects.all().select_related('order', 'stock', 'user')
        return TradeExecution.objects.filter(user=user).select_related('order', 'stock')
