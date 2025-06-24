from django.contrib.auth.models import AbstractUser
from django.db import models
# Ensure locations.Location can be referenced. If locations app is defined, this is fine.
# from locations.models import Location # Direct import if needed, or string reference

class User(AbstractUser):
    email = models.EmailField(unique=True)
    is_approved_by_admin = models.BooleanField(default=False, help_text="Designates whether the user's dashboard access is approved by an admin.")
    authorized_locations = models.ManyToManyField(
        'locations.Location', 
        blank=True,
        related_name='authorized_users',
        help_text="Locations this user is authorized to access data for."
    )

    # USERNAME_FIELD = 'email' # If you want to log in with email
    # REQUIRED_FIELDS = ['username'] # If USERNAME_FIELD is 'email'

    def __str__(self):
        return self.username