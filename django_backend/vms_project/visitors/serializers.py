from rest_framework import serializers
from .models import Visitor
# from images.serializers import StoredImageSerializer # If linking to StoredImage

class VisitorSerializer(serializers.ModelSerializer):
    # If you have a ForeignKey to StoredImage in Visitor model:
    # visitorImage = StoredImageSerializer(read_only=True) # For displaying image details
    # visitorImage_id = serializers.PrimaryKeyRelatedField(
    #     queryset=StoredImage.objects.all(), source='visitorImage', write_only=True, allow_null=True, required=False
    # )

    class Meta:
        model = Visitor
        fields = [
            'id', 'idNumberType', 'fullName', 'contact', 'email', 
            'reason', 'approvedBy', 'requestedBy', 'requestSource',
            'checkInTime', 'checkOutTime', 
            # 'visitor_image_file', # If direct image upload on Visitor model
            # 'visitorImage', 'visitorImage_id' # If ForeignKey to StoredImage
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'checkInTime') # checkInTime is set by default

    def create(self, validated_data):
        # checkInTime is default=timezone.now, so it's handled by the model
        return super().create(validated_data)

class VisitorCheckoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Visitor
        fields = ['checkOutTime'] # Only allow updating checkOutTime
        read_only_fields = [] # Ensure checkOutTime can be written