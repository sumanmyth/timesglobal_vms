from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StoredImageViewSet

router = DefaultRouter()
router.register(r'', StoredImageViewSet, basename='storedimage') # Base path /api/images/

urlpatterns = [
    path('', include(router.urls)),
]