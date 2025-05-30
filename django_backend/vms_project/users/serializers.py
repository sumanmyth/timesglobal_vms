from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions as django_exceptions


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Check if username (which might be email) already exists
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with that username already exists."})
        
        # Check if email already exists if it's different from username
        # (Frontend sends email as username, so this might be redundant but good for general cases)
        if attrs.get('email') and User.objects.filter(email=attrs['email']).exists():
             # Only raise if the existing user isn't the one being created/updated (relevant for updates)
            if not (self.instance and self.instance.email == attrs['email']):
                 raise serializers.ValidationError({"email": "This email address is already in use."})

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user information (read-only for now)
    """
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff')
        read_only_fields = fields