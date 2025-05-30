from django.urls import path
from .views import UserRegistrationView, CustomTokenObtainPairView, UserDetailView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'), # Corresponds to frontend's /auth/login/
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/<int:pk>/', UserDetailView.as_view(), name='user_profile'), # Example, if needed
]