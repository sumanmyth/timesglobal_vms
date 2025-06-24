from rest_framework import serializers
from .models import Visitor
from locations.models import Location
from locations.serializers import LocationSerializer

class VisitorSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)
    location_id = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(), source='location', write_only=True
    )

    class Meta:
        model = Visitor
        fields = [
            'id', 'location', 'location_id', 'idNumberType', 'fullName', 'contact', 'email', 
            'reason', 'approvedBy', 'requestedBy', 'requestSource',
            'checkInTime', 'checkOutTime', 
            'created_by_name', 'created_by_email', # Added fields
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'checkInTime', 'created_by_name', 'created_by_email') # Added fields

    # No need to override create if BaseLocationScopedViewSet.perform_create handles created_by_*

class VisitorCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = ['checkOutTime']
        read_only_fields = []