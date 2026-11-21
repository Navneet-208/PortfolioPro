from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PortfolioHoldingViewSet, PortfolioSnapshotViewSet, portfolio_summary

router = DefaultRouter()
router.register(r'holdings', PortfolioHoldingViewSet, basename='holding')
router.register(r'snapshots', PortfolioSnapshotViewSet, basename='snapshot')

urlpatterns = [
    path('summary/', portfolio_summary, name='portfolio_summary'),
    path('', include(router.urls)),
]
