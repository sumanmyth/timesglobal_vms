from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import User

class CustomTokenObtainPairView(TokenObtainPairView):
    # You can customize the response if needed by overriding post method
    # For now, default behavior is fine
    pass

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny] # Allow anyone to register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            # You could return a token here upon successful registration if desired
            # Or just a success message
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data,
                "message": "User registered successfully. Please log in."
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            # Log the error for debugging
            print(f"Registration error: {e}") # Basic logging
            # Ensure specific validation errors from serializer are returned
            if hasattr(serializer, 'errors') and serializer.errors:
                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Or IsAuthenticated if you want only logged in users to see profiles
    lookup_field = 'pk' # or 'username'