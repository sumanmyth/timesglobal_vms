# <<<< START OF FILE task_management/models.py >>>>
from django.db import models
from django.db.models import Max # For auto-incrementing job_id
from django.utils import timezone
from locations.models import Location 
from django.conf import settings # To get User model

class Task(models.Model):
    location = models.ForeignKey(Location, on_delete=models.PROTECT, related_name='tasks')
    job_date = models.DateField()
    # job_id will be auto-generated, make it not directly editable by user through API form
    job_id = models.CharField(max_length=100, editable=False, help_text="Auto-generated Job ID (e.g., LOC-0001)") 
    job_title = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255, help_text="Client or contact person's full name for the task")
    company_name = models.CharField(max_length=255)
    company_location = models.CharField(max_length=255, blank=True, null=True)
    rack_number = models.CharField(max_length=100)
    job_description = models.TextField(blank=True, null=True)
    contact = models.CharField(max_length=100, blank=True, null=True, help_text="Contact number for the task (can be auto-filled)")
    encoded_by = models.CharField(max_length=255, help_text="Name of the user who encoded/entered the task details")
    
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Fields to store creator's information
    created_by_name = models.CharField(max_length=255, blank=True, null=True, editable=False, help_text="Full name of the user who created this task.")
    created_by_email = models.EmailField(blank=True, null=True, editable=False, help_text="Email of the user who created this task.")
    # Optional: Link to the user model
    # created_by_user = models.ForeignKey(
    #     settings.AUTH_USER_MODEL,
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True,
    #     related_name='%(app_label)s_%(class)s_created_by', # Unique related_name
    #     editable=False
    # )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.job_id and self.location:
            # Generate a simple auto-incrementing job_id per location
            # This is a basic example, consider more robust strategies for production
            # (e.g., using a separate sequence, UUIDs, or more complex prefixes)
            last_task_agg = Task.objects.filter(location=self.location).aggregate(max_numeric_job_id=Max('job_id'))
            
            current_max_numeric = 0
            if last_task_agg['max_numeric_job_id']:
                try:
                    # Assuming job_id is purely numeric for simplicity in this example
                    # If you use prefixes like "TASK-", you'll need to parse the numeric part
                    current_max_numeric = int(last_task_agg['max_numeric_job_id'])
                except ValueError:
                    # Handle cases where job_id might not be purely numeric or parsing fails
                    # For example, count existing tasks for a fallback or use a timestamp
                    current_max_numeric = Task.objects.filter(location=self.location).count() 

            next_numeric_id = current_max_numeric + 1
            
            # Example job_id format: "KTM-0001" (Location Prefix - Sequential Number)
            # self.job_id = f"{self.location.name[:3].upper()}-{next_numeric_id:04d}" 
            # For simpler purely numeric job_id:
            self.job_id = str(next_numeric_id)

        super().save(*args, **kwargs)

    def __str__(self):
        status = 'Completed' if self.is_completed else 'Pending'
        return f"{self.job_title} ({self.job_id}) at {self.location.name} - {status}"

    class Meta:
        ordering = ['-job_date', '-created_at']
        # Make job_id unique per location. If job_id format is complex, this might need adjustment.
        # If job_id is generated purely sequentially per location, this is appropriate.
        unique_together = (('location', 'job_id'),) 

# <<<< END OF FILE task_management/models.py >>>>