from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer as BaseTokenObtainPairSerializer
from locations.serializers import LocationSerializer # To nest location details for UserSerializer if needed

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm Password")

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False}, # Frontend sends full_name, which is split
            'last_name': {'required': False},  # So these are not directly required from API client
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Frontend sends email as username, so User.username will store the email.
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({"username": "A user with that username (email) already exists."})
        
        # This check might be redundant if username is always the email, but good for general case.
        if attrs.get('email') and User.objects.filter(email=attrs['email']).exists():
            # Only raise if the existing user isn't the one being created/updated (relevant for updates)
            if not (self.instance and self.instance.email == attrs['email']):
                 raise serializers.ValidationError({"email": "This email address is already in use."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'], # This will be the email
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''), # From split full_name
            last_name=validated_data.get('last_name', '')   # From split full_name
        )
        user.set_password(validated_data['password'])
        user.is_active = True 
        user.is_approved_by_admin = False 
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for displaying user information, including authorized locations.
    """
    authorized_locations = LocationSerializer(many=True, read_only=True) 
    display_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'display_name',
            'is_staff', 'is_active', 'is_approved_by_admin', 'authorized_locations'
        )
        read_only_fields = fields 

    def get_display_name(self, obj):
        full_name = obj.get_full_name()
        return full_name if full_name else obj.username # Fallback to username (which is email)


class CustomTokenObtainPairSerializer(BaseTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims to the JWT token itself
        token['username'] = user.username # This is the email
        token['email'] = user.email
        token['display_name'] = user.get_full_name() or user.username # Add display_name to token
        token['is_approved_by_admin'] = user.is_approved_by_admin
        token['authorized_locations_preview'] = [{'id': loc.id, 'name': loc.name} for loc in user.authorized_locations.all()]
        return token

    def validate(self, attrs):
        data = super().validate(attrs) # This gives access and refresh tokens
        
        # Add user details to the overall login response body
        user_full_name = self.user.get_full_name()
        display_name_for_response = user_full_name if user_full_name else self.user.username

        user_details = {
            'id': self.user.id,
            'username': self.user.username, # This is the email address used for login
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'display_name': display_name_for_response, # Use full name, fallback to username (email)
            'is_staff': self.user.is_staff,
            'is_active': self.user.is_active,
            'is_approved_by_admin': self.user.is_approved_by_admin,
            'authorized_locations': [{'id': loc.id, 'name': loc.name} for loc in self.user.authorized_locations.all()],
        }
        data['user'] = user_details
        return data