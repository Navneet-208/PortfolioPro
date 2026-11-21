import os
from pathlib import Path
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.http import JsonResponse, HttpResponse, FileResponse
from django.conf import settings
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

BASE_DIR = settings.BASE_DIR

def api_root_index(request):
    return JsonResponse({
        'name': 'PortfolioPro API',
        'version': '1.0.0',
        'description': 'Advanced Stock Trading and Portfolio Management Application',
        'documentation': '/api/docs/',
        'endpoints': {
            'auth': '/api/accounts/auth/',
            'accounts': '/api/accounts/accounts/',
            'transactions': '/api/accounts/transactions/',
            'stocks': '/api/stocks/stocks/',
            'watchlists': '/api/stocks/watchlists/',
            'trading_orders': '/api/trading/orders/',
            'trade_executions': '/api/trading/executions/',
            'portfolio_holdings': '/api/portfolio/holdings/',
            'portfolio_summary': '/api/portfolio/summary/',
            'risk_metrics': '/api/risk/metrics/',
            'risk_limits': '/api/risk/limits/',
            'risk_audit': '/api/risk/audit/',
            'technical_analysis': '/api/analysis/technical/{symbol}/',
            'fundamental_reports': '/api/analysis/fundamentals/',
            'notifications': '/api/notifications/notifications/',
            'price_alerts': '/api/notifications/alerts/',
            'support_tickets': '/api/support/tickets/',
            'openapi_schema': '/api/schema/',
            'swagger_ui': '/api/docs/',
            'redoc': '/api/redoc/'
        }
    })

def serve_react_app(request):
    dist_index = BASE_DIR / 'frontend' / 'dist' / 'index.html'
    if dist_index.exists():
        with open(dist_index, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    return api_root_index(request)

def serve_react_assets(request, path):
    asset_file = BASE_DIR / 'frontend' / 'dist' / 'assets' / path
    if asset_file.exists():
        content_type = 'application/javascript' if path.endswith('.js') else ('text/css' if path.endswith('.css') else 'application/octet-stream')
        return FileResponse(open(asset_file, 'rb'), content_type=content_type)
    return HttpResponse(status=404)

urlpatterns = [
    path('admin/', admin.site.urls),

    # API Root
    path('api/', api_root_index, name='api_root'),

    # Modular API routes
    path('api/accounts/', include('accounts.urls')),
    path('api/stocks/', include('stocks.urls')),
    path('api/trading/', include('trading.urls')),
    path('api/portfolio/', include('portfolio.urls')),
    path('api/risk/', include('risk.urls')),
    path('api/analysis/', include('analysis.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/support/', include('support.urls')),

    # OpenAPI 3.0 & Swagger / Redoc Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Serve Vite React Production Assets
    path('assets/<path:path>', serve_react_assets, name='react_assets'),

    # React App Entry for Root
    path('', serve_react_app, name='react_app'),
]
