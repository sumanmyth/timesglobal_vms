# <<<< START OF FILE locations/models.py >>>>
from django.db import models

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = "Data Center Location"
        verbose_name_plural = "Data Center Locations"

# <<<< END OF FILE locations/models.py >>>>