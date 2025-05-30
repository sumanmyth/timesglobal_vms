from django.db import models
from django.utils import timezone

# Device Storage Form Models
class DeviceStorageEntry(models.Model):
    company_name = models.CharField(max_length=255, default="Times Global")
    date = models.DateField(default=timezone.now)
    office_address = models.CharField(max_length=500, default="Main Office Address")
    
    submitter_name = models.CharField(max_length=255)
    submitter_company_name = models.CharField(max_length=255, blank=True, null=True)
    submitter_designation = models.CharField(max_length=255, blank=True, null=True)
    submitter_contact = models.CharField(max_length=50, blank=True, null=True)
    submitter_signature = models.CharField(max_length=255, help_text="Typed name as signature") # Storing typed name
    prepared_by_signature = models.CharField(max_length=255, help_text="Typed name as signature") # Storing typed name

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Device Storage Entry by {self.submitter_name} on {self.date}"

    class Meta:
        verbose_name = "Device Storage Entry"
        verbose_name_plural = "Device Storage Entries"
        ordering = ['-date']

class DeviceStorageItem(models.Model):
    entry = models.ForeignKey(DeviceStorageEntry, related_name='items', on_delete=models.CASCADE)
    sno = models.CharField(max_length=50, blank=True, null=True, verbose_name="S.No.")
    quantity = models.CharField(max_length=50, blank=True, null=True) # Using CharField as per frontend
    description = models.CharField(max_length=500, verbose_name="Item Description")
    rackNo = models.CharField(max_length=100, blank=True, null=True, verbose_name="Rack No.")
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.description} (Qty: {self.quantity})"

    class Meta:
        verbose_name = "Device Storage Item"
        verbose_name_plural = "Device Storage Items"


# Gate Pass Form Models
class GatePass(models.Model):
    recipient_name = models.CharField(max_length=255, verbose_name="Recipient Name (MR/MRS.)")
    recipient_address = models.TextField(blank=True, null=True, verbose_name="Recipient Address")
    
    prepared_by = models.CharField(max_length=255, verbose_name="Prepared By")
    received_by = models.CharField(max_length=255, blank=True, null=True, verbose_name="Received By")
    approved_by = models.CharField(max_length=255, verbose_name="Approved By")

    pass_date = models.DateField(default=timezone.now) # Auto-set date of creation
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Gate Pass for {self.recipient_name} on {self.pass_date}"

    class Meta:
        verbose_name = "Gate Pass"
        verbose_name_plural = "Gate Passes"
        ordering = ['-pass_date']

class GatePassItem(models.Model):
    gate_pass = models.ForeignKey(GatePass, related_name='items', on_delete=models.CASCADE)
    sno = models.CharField(max_length=50, blank=True, null=True, verbose_name="S.No.")
    itemName = models.CharField(max_length=255, verbose_name="Item Name")
    description = models.TextField(blank=True, null=True)
    quantity = models.CharField(max_length=50, verbose_name="Quantity") # Using CharField as per frontend
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.itemName} (Qty: {self.quantity})"

    class Meta:
        verbose_name = "Gate Pass Item"
        verbose_name_plural = "Gate Pass Items"