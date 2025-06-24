from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, UserSerializer, CustomTokenObtainPairSerializer
from .models import User

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            user = serializer.save() 
            # User is_active is True by default from serializer, is_approved_by_admin is False
            return Response({
                "user": UserSerializer(user, context=self.get_serializer_context()).data, # Return basic user data
                "message": "User registered successfully. Account pending admin approval. Please log in."
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Registration error: {e}")
            if hasattr(serializer, 'errors') and serializer.errors:
                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated] 
    
    def get_object(self):
        # Returns the current logged-in user's details
        return self.request.user