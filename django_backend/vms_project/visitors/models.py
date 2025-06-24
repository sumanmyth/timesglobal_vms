from django.db import models
from django.utils import timezone
from locations.models import Location # Import Location model
# from django.conf import settings # If you decide to link to User model directly

class Visitor(models.Model):
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='visitors')
    idNumberType = models.CharField(max_length=100, blank=True, null=True, verbose_name="ID Number/Type")
    fullName = models.CharField(max_length=255, verbose_name="Full Name")
    contact = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    reason = models.TextField(blank=True, null=True, verbose_name="Reason for Visit")
    approvedBy = models.CharField(max_length=255, blank=True, null=True, verbose_name="Approved By")
    requestedBy = models.CharField(max_length=255, blank=True, null=True, verbose_name="Requested By")
    requestSource = models.CharField(max_length=100, blank=True, null=True, verbose_name="Request Source")
    
    checkInTime = models.DateTimeField(default=timezone.now, verbose_name="Check-In Time")
    checkOutTime = models.DateTimeField(blank=True, null=True, verbose_name="Check-Out Time")

    # Fields to store creator's information
    created_by_name = models.CharField(max_length=255, blank=True, null=True, editable=False, help_text="Full name of the user who created this entry.")
    created_by_email = models.EmailField(blank=True, null=True, editable=False, help_text="Email of the user who created this entry.")
    # Optional: Direct link to user model
    # created_by_user = models.ForeignKey(
    #     settings.AUTH_USER_MODEL, 
    #     on_delete=models.SET_NULL, 
    #     null=True, blank=True, 
    #     related_name='visitor_records_created_by', 
    #     editable=False
    # )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fullName} at {self.location.name} - Checked In: {self.checkInTime.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-checkInTime']
        verbose_name = "Visitor Record"
        verbose_name_plural = "Visitor Records"