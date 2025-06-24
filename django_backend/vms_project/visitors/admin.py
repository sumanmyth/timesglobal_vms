# <<<< START OF FILE visitors/admin.py >>>>
from django.contrib import admin
from .models import Visitor

@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'location', 'idNumberType', 'checkInTime', 'checkOutTime', 'reason', 'approvedBy', 'contact', 'email', 'created_by_name', 'created_by_email')
    list_filter = ('location', 'checkInTime', 'checkOutTime', 'requestSource', 'approvedBy', 'created_by_name')
    search_fields = ('location__name', 'fullName', 'idNumberType', 'contact', 'email', 'reason', 'created_by_name', 'created_by_email')
    date_hierarchy = 'checkInTime'
    readonly_fields = ('created_at', 'updated_at', 'created_by_name', 'created_by_email') 

    fieldsets = (
        (None, {
            'fields': ('location', 'fullName', 'idNumberType', 'contact', 'email')
        }),
        ('Visit Details', {
            'fields': ('reason', 'approvedBy', 'requestedBy', 'requestSource')
        }),
        ('Record Creator Information', {
            'fields': ('created_by_name', 'created_by_email'),
            'classes': ('collapse',),
        }),
        ('Timestamps', {
            'fields': ('checkInTime', 'checkOutTime', 'created_at', 'updated_at'),
             'classes': ('collapse',),
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        # Base readonly fields (including those from model that are editable=False)
        readonly = list(super().get_readonly_fields(request, obj))
        
        # Add 'checkInTime' to readonly fields if editing an existing object
        if obj: 
            if 'checkInTime' not in readonly:
                readonly.append('checkInTime')
        return readonly

# <<<< END OF FILE visitors/admin.py >>>>