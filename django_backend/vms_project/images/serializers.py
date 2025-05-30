from rest_framework import serializers
from .models import StoredImage

class StoredImageSerializer(serializers.ModelSerializer):
    imageFile = serializers.ImageField(use_url=True) 

    class Meta:
        model = StoredImage
        fields = ['id', 'fullName', 'contact', 'email', 'imageFile', 'idType', 'uploaded_at', 'updated_at'] # Added contact and email
        read_only_fields = ('id', 'uploaded_at', 'updated_at')

    def validate_imageFile(self, value):
        if value.size > 5 * 1024 * 1024: # 5MB limit example
            raise serializers.ValidationError("Image file too large. Max size is 5MB.")
        return value