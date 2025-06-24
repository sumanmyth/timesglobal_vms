# <<<< START OF FILE locations/views.py >>>>
from rest_framework import viewsets, permissions
from .models import Location
from .serializers import LocationSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAdminUser] # Only admins can manage locations

# <<<< END OF FILE locations/views.py >>>>