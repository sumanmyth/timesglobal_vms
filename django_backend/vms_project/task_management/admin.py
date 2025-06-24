from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        'job_id', 
        'location',
        'job_title', 
        'job_date', 
        'full_name', 
        'company_name', 
        'encoded_by', 
        'is_completed',
        'created_by_name', 
        'created_by_email',
        'created_at'
    )
    list_filter = ('location', 'is_completed', 'job_date', 'company_name', 'encoded_by', 'created_by_name')
    search_fields = (
        'location__name',
        'job_id', 
        'job_title', 
        'full_name', 
        'company_name', 
        'rack_number', 
        'encoded_by',
        'created_by_name',
        'created_by_email'
    )
    date_hierarchy = 'job_date'
    ordering = ('-job_date', '-created_at')
    
    fieldsets = (
        (None, {
            'fields': ('location', 'job_id', 'job_title', 'job_date', 'is_completed')
        }),
        ('Client & Company Details', {
            'fields': ('full_name', 'company_name', 'company_location', 'contact')
        }),
        ('Task Specifics', {
            'fields': ('rack_number', 'job_description')
        }),
        ('Record Creator & Meta Information', { 
            'fields': ('encoded_by', 'created_by_name', 'created_by_email', 'completed_at', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    # job_id, created_by_name, created_by_email are editable=False in model.
    # completed_at is handled by view logic.
    readonly_fields = ('job_id', 'completed_at', 'created_by_name', 'created_by_email', 'created_at', 'updated_at')