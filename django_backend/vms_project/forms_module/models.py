from django.db import models
from django.utils import timezone
from locations.models import Location 
from django.conf import settings # To get the User model

class DeviceStorageEntry(models.Model):
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='device_storage_entries')
    company_name = models.CharField(max_length=255, default="Times Global")
    date = models.DateField(default=timezone.now) 
    office_address = models.CharField(max_length=500, default="Main Office Address") 
    
    submitter_name = models.CharField(max_length=255)
    submitter_company_name = models.CharField(max_length=255, blank=True, null=True)
    submitter_designation = models.CharField(max_length=255, blank=True, null=True)
    submitter_contact = models.CharField(max_length=50, blank=True, null=True)
    submitter_signature = models.CharField(max_length=255, help_text="Typed name as signature")
    prepared_by_signature = models.CharField(max_length=255, help_text="Typed name as signature")

    # Fields to store creator's information
    created_by_name = models.CharField(max_length=255, blank=True, null=True, editable=False, help_text="Full name of the user who created this entry.")
    created_by_email = models.EmailField(blank=True, null=True, editable=False, help_text="Email of the user who created this entry.")
    # Optional: If you want a direct link to the user model (recommended for robust tracking)
    # created_by_user = models.ForeignKey(
    #     settings.AUTH_USER_MODEL, 
    #     on_delete=models.SET_NULL, # Or models.PROTECT if user deletion should prevent record deletion
    #     null=True, 
    #     blank=True, 
    #     related_name='%(app_label)s_%(class)s_created_by', # Ensures unique related_name
    #     editable=False 
    # )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Device Storage Entry by {self.submitter_name} at {self.location.name} on {self.date}"

    class Meta:
        verbose_name = "Device Storage Entry"
        verbose_name_plural = "Device Storage Entries"
        ordering = ['-date']

class DeviceStorageItem(models.Model):
    entry = models.ForeignKey(DeviceStorageEntry, related_name='items', on_delete=models.CASCADE)
    sno = models.CharField(max_length=50, blank=True, null=True, verbose_name="S.No.")
    quantity = models.CharField(max_length=50, blank=True, null=True) 
    description = models.CharField(max_length=500, verbose_name="Item Description")
    rackNo = models.CharField(max_length=100, blank=True, null=True, verbose_name="Rack No.")
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.description} (Qty: {self.quantity})"

    class Meta:
        verbose_name = "Device Storage Item"
        verbose_name_plural = "Device Storage Items"


class GatePass(models.Model):
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='gate_passes')
    recipient_name = models.CharField(max_length=255, verbose_name="Recipient Name (MR/MRS.)")
    recipient_address = models.TextField(blank=True, null=True, verbose_name="Recipient Address")
    
    prepared_by = models.CharField(max_length=255, verbose_name="Prepared By")
    received_by = models.CharField(max_length=255, blank=True, null=True, verbose_name="Received By")
    approved_by = models.CharField(max_length=255, verbose_name="Approved By")

    pass_date = models.DateField() 

    # Fields to store creator's information
    created_by_name = models.CharField(max_length=255, blank=True, null=True, editable=False, help_text="Full name of the user who created this pass.")
    created_by_email = models.EmailField(blank=True, null=True, editable=False, help_text="Email of the user who created this pass.")
    # Optional: Link to the user model
    # created_by_user = models.ForeignKey(
    #     settings.AUTH_USER_MODEL, 
    #     on_delete=models.SET_NULL, 
    #     null=True, 
    #     blank=True, 
    #     related_name='%(app_label)s_%(class)s_created_by', # Ensures unique related_name
    #     editable=False
    # )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Gate Pass for {self.recipient_name} at {self.location.name} on {self.pass_date}"

    class Meta:
        verbose_name = "Gate Pass"
        verbose_name_plural = "Gate Passes"
        ordering = ['-pass_date']

class GatePassItem(models.Model):
    gate_pass = models.ForeignKey(GatePass, related_name='items', on_delete=models.CASCADE)
    sno = models.CharField(max_length=50, blank=True, null=True, verbose_name="S.No.")
    itemName = models.CharField(max_length=255, verbose_name="Item Name")
    description = models.TextField(blank=True, null=True)
    quantity = models.CharField(max_length=50, verbose_name="Quantity") 
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.itemName} (Qty: {self.quantity})"

    class Meta:
        verbose_name = "Gate Pass Item"
        verbose_name_plural = "Gate Pass Items"