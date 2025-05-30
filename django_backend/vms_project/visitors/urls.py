from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisitorViewSet

router = DefaultRouter()
router.register(r'', VisitorViewSet, basename='visitor') # Empty string for base path /api/visitors/

urlpatterns = [
    path('', include(router.urls)),
]