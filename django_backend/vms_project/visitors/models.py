from django.db import models
from django.utils import timezone

# Forward declaration for VisitorImage, if Visitor model needs to reference it before definition
# class VisitorImage(models.Model): ... (define later or import if in different file)

class Visitor(models.Model):
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

    # Link to a specific uploaded image for this visitor entry, if applicable
    # This could be a ForeignKey to your `images.StoredImage` if you want to pick from a gallery,
    # or a direct ImageField here if each visitor record has its own unique image.
    # For now, let's assume the VMSAddImagePage is for a general gallery, and visitor-specific images
    # might be handled differently or linked via a ForeignKey if needed.
    # If visitorImage is a direct upload per visit:
    # visitor_image_file = models.ImageField(upload_to='visitor_entry_images/', blank=True, null=True, verbose_name="Visitor Image for this Entry")

    # If visitorImage refers to an image in the `images.StoredImage` model:
    # visitorImage = models.ForeignKey('images.StoredImage', on_delete=models.SET_NULL, null=True, blank=True, related_name='visitor_entries')


    # Placeholder for future document linking (e.g., ManyToManyField to a Document model)
    # documents = models.ManyToManyField('VisitorDocument', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.fullName} - Checked In: {self.checkInTime.strftime('%Y-%m-%d %H:%M')}"

    class Meta:
        ordering = ['-checkInTime']
        verbose_name = "Visitor Record"
        verbose_name_plural = "Visitor Records"

# Example for VisitorDocument if you add it later
# class VisitorDocument(models.Model):
#     visitor = models.ForeignKey(Visitor, related_name='visitor_documents', on_delete=models.CASCADE)
#     document_file = models.FileField(upload_to='visitor_documents/')
#     description = models.CharField(max_length=255, blank=True)
#     uploaded_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Document for {self.visitor.fullName} - {self.description or self.document_file.name}"