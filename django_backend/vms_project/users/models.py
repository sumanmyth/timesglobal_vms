from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Add any additional fields here if needed, e.g.:
    # phone_number = models.CharField(max_length=15, blank=True, null=True)
    # profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    
    # Make email unique and required for registration logic
    email = models.EmailField(unique=True)

    #USERNAME_FIELD = 'email' # If you want to log in with email instead of username
    #REQUIRED_FIELDS = ['username'] # If USERNAME_FIELD is 'email', then 'username' might go here if still used

    def __str__(self):
        return self.username