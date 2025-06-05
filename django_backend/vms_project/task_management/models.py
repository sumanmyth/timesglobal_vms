# django_backend/vms_project/task_management/models.py
from django.db import models
from django.utils import timezone

class Task(models.Model):
    job_date = models.DateField()
    job_id = models.CharField(max_length=100, unique=True)
    job_title = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)
    company_name = models.CharField(max_length=255)
    company_location = models.CharField(max_length=255, blank=True, null=True)
    rack_number = models.CharField(max_length=100)
    job_description = models.TextField(blank=True, null=True)
    contact = models.CharField(max_length=100, blank=True, null=True)
    encoded_by = models.CharField(max_length=255)
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.job_title} ({self.job_id}) - {'Completed' if self.is_completed else 'Pending'}"

    class Meta:
        ordering = ['-job_date', '-created_at']