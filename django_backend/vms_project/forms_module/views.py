from rest_framework import viewsets
from .models import DeviceStorageEntry, GatePass
from .serializers import DeviceStorageEntrySerializer, GatePassSerializer
from rest_framework.permissions import IsAuthenticated # Ensure users are logged in

class DeviceStorageEntryViewSet(viewsets.ModelViewSet):
    queryset = DeviceStorageEntry.objects.all().order_by('-date')
    serializer_class = DeviceStorageEntrySerializer
    permission_classes = [IsAuthenticated] # Or more specific permissions

class GatePassViewSet(viewsets.ModelViewSet):
    queryset = GatePass.objects.all().order_by('-pass_date')
    serializer_class = GatePassSerializer
    permission_classes = [IsAuthenticated] # Or more specific permissions