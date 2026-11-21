from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Stock, StockPriceHistory, Watchlist
from .serializers import StockSerializer, StockPriceHistorySerializer, WatchlistSerializer

class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.filter(is_active=True).order_by('symbol')
    serializer_class = StockSerializer
    lookup_field = 'symbol'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

    def filter_queryset(self, queryset):
        sector = self.request.query_params.get('sector')
        search = self.request.query_params.get('search')
        exchange = self.request.query_params.get('exchange')

        if sector:
            queryset = queryset.filter(sector__iexact=sector)
        if exchange:
            queryset = queryset.filter(exchange__iexact=exchange)
        if search:
            queryset = queryset.filter(symbol__icontains=search) | queryset.filter(company_name__icontains=search)
        return queryset

    @action(detail=True, methods=['get'])
    def history(self, request, symbol=None):
        stock = self.get_object()
        days = int(request.query_params.get('days', 30))
        history_records = StockPriceHistory.objects.filter(stock=stock).order_by('-date')[:days]
        # Return in ascending order for charts
        serializer = StockPriceHistorySerializer(reversed(list(history_records)), many=True)
        return Response({
            'symbol': stock.symbol,
            'company_name': stock.company_name,
            'current_price': stock.current_price,
            'history': serializer.data
        })


class WatchlistViewSet(viewsets.ModelViewSet):
    serializer_class = WatchlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Watchlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def add_stock(self, request, pk=None):
        watchlist = self.get_object()
        symbol = request.data.get('symbol')
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        watchlist.stocks.add(stock)
        return Response(WatchlistSerializer(watchlist).data)

    @action(detail=True, methods=['post'])
    def remove_stock(self, request, pk=None):
        watchlist = self.get_object()
        symbol = request.data.get('symbol')
        stock = get_object_or_404(Stock, symbol__iexact=symbol)
        watchlist.stocks.remove(stock)
        return Response(WatchlistSerializer(watchlist).data)
