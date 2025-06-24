# <<<< START OF FILE locations/serializers.py >>>>
from rest_framework import serializers
from .models import Location

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'description']

# <<<< END OF FILE locations/serializers.py >>>>