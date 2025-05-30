from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeviceStorageEntryViewSet, GatePassViewSet

router = DefaultRouter()
router.register(r'device-storage', DeviceStorageEntryViewSet, basename='device-storage')
router.register(r'gate-passes', GatePassViewSet, basename='gate-pass')

urlpatterns = [
    path('', include(router.urls)),
]