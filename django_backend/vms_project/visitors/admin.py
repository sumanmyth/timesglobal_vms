from django.contrib import admin
from .models import Visitor #, VisitorDocument

@admin.register(Visitor)
class VisitorAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'idNumberType', 'checkInTime', 'checkOutTime', 'reason', 'approvedBy', 'contact', 'email')
    list_filter = ('checkInTime', 'checkOutTime', 'requestSource', 'approvedBy')
    search_fields = ('fullName', 'idNumberType', 'contact', 'email', 'reason')
    date_hierarchy = 'checkInTime'
    readonly_fields = ('created_at', 'updated_at', 'checkInTime') # 'checkInTime' if set by default=timezone.now

    fieldsets = (
        (None, {
            'fields': ('fullName', 'idNumberType', 'contact', 'email')
        }),
        ('Visit Details', {
            'fields': ('reason', 'approvedBy', 'requestedBy', 'requestSource')
        }),
        ('Timestamps', {
            'fields': ('checkInTime', 'checkOutTime', 'created_at', 'updated_at'),
             'classes': ('collapse',), # Make this section collapsible
        }),
        # ('Image', { # If direct image upload on Visitor model
        #     'fields': ('visitor_image_file',) 
        # }),
        # ('Linked Image', { # If ForeignKey to StoredImage
        #     'fields': ('visitorImage',)
        # }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        # Make checkInTime editable only on creation
        if obj: # In edit mode
            return self.readonly_fields + ('checkInTime',)
        return self.readonly_fields


# If you have VisitorDocument model
# @admin.register(VisitorDocument)
# class VisitorDocumentAdmin(admin.ModelAdmin):
#     list_display = ('visitor', 'description', 'document_file', 'uploaded_at')
#     list_filter = ('uploaded_at',)
#     search_fields = ('visitor__fullName', 'description')