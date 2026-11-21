from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import technical_analysis_detail, FundamentalReportViewSet

router = DefaultRouter()
router.register(r'fundamentals', FundamentalReportViewSet, basename='fundamental')

urlpatterns = [
    path('technical/<str:symbol>/', technical_analysis_detail, name='technical_analysis'),
    path('fundamentals/<str:symbol>/detail/', FundamentalReportViewSet.by_symbol, name='fundamental_by_symbol'),
    path('', include(router.urls)),
]
