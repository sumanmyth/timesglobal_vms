# django_backend/vms_project/task_management/admin.py
from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        'job_id', 
        'job_title', 
        'job_date', 
        'full_name', 
        'company_name', 
        'rack_number', 
        'encoded_by', 
        'is_completed',   # Added
        'completed_at',   # Added
        'created_at'
    )
    list_filter = ('job_date', 'company_name', 'encoded_by', 'is_completed') # Added is_completed
    search_fields = (
        'job_id', 
        'job_title', 
        'full_name', 
        'company_name', 
        'rack_number', 
        'encoded_by'
    )
    date_hierarchy = 'job_date'
    ordering = ('-job_date', '-created_at')
    fieldsets = (
        (None, {
            'fields': ('job_id', 'job_title', 'job_date', 'is_completed') # Added is_completed
        }),
        ('Client & Company Details', {
            'fields': ('full_name', 'company_name', 'company_location', 'contact')
        }),
        ('Task Specifics', {
            'fields': ('rack_number', 'job_description')
        }),
        ('Meta Information', {
            'fields': ('encoded_by', 'completed_at', 'created_at', 'updated_at'), # Added completed_at
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('completed_at', 'created_at', 'updated_at') # Added completed_at