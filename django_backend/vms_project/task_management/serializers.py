# django_backend/vms_project/task_management/serializers.py
from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id', 
            'job_date', 
            'job_id', 
            'job_title', 
            'full_name', 
            'company_name', 
            'company_location', 
            'rack_number', 
            'job_description', 
            'contact', 
            'encoded_by',
            'is_completed',   # Added
            'completed_at',   # Added
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'completed_at') # completed_at is set by server