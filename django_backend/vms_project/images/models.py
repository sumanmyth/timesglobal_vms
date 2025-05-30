from django.db import models

def image_upload_path(instance, filename):
    # file will be uploaded to MEDIA_ROOT/stored_images/<id_type>/<fullname_or_email>/<filename>
    # Using email in path if fullname is not unique enough or contains problematic characters
    identifier = instance.email if instance.email else instance.fullName.replace(" ", "_")
    return f'stored_images/{instance.idType.lower()}/{identifier}/{filename}'

class StoredImage(models.Model):
    ID_TYPE_CHOICES = [
        ('Visitor', 'Visitor'),
        ('Staff', 'Staff'),
        ('Contractor', 'Contractor'),
        ('Other', 'Other'),
    ]
    fullName = models.CharField(max_length=255, verbose_name="Full Name")
    # Add contact and email fields
    contact = models.CharField(max_length=50, blank=True, null=True, verbose_name="Contact Number")
    email = models.EmailField(blank=True, null=True, verbose_name="Email Address")
    
    imageFile = models.ImageField(upload_to=image_upload_path, verbose_name="Image File")
    idType = models.CharField(max_length=50, choices=ID_TYPE_CHOICES, default='Visitor', verbose_name="ID Type")
    
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Image of {self.fullName} ({self.idType})"

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Stored Image (User Registration)" # Updated verbose name
        verbose_name_plural = "Stored Images (User Registrations)"