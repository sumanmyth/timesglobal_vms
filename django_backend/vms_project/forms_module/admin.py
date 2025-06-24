from django.contrib import admin
from .models import DeviceStorageEntry, DeviceStorageItem, GatePass, GatePassItem

class DeviceStorageItemInline(admin.TabularInline):
    model = DeviceStorageItem
    extra = 1 
    fields = ('sno', 'quantity', 'description', 'rackNo', 'remarks')

@admin.register(DeviceStorageEntry)
class DeviceStorageEntryAdmin(admin.ModelAdmin):
    list_display = (
        'submitter_name', 
        'location', 
        'date', 
        'company_name', 
        'created_by_name', 
        'created_by_email',
        'created_at'
    )
    list_filter = ('location', 'date', 'company_name', 'submitter_company_name', 'created_by_name', 'created_by_email')
    search_fields = ('location__name', 'submitter_name', 'company_name', 'items__description', 'created_by_name', 'created_by_email')
    inlines = [DeviceStorageItemInline]
    date_hierarchy = 'date' 
    
    fieldsets = (
        ("Entry Details", {
            'fields': ('location', 'company_name', 'date', 'office_address')
        }),
        ("Submitter Information", {
            'fields': ('submitter_name', 'submitter_company_name', 'submitter_designation', 'submitter_contact')
        }),
        ("Signatures", {
            'fields': ('submitter_signature', 'prepared_by_signature')
        }),
        ("Record Creator Information", { 
            'fields': ('created_by_name', 'created_by_email'),
            'classes': ('collapse',), 
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',) 
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'created_by_name', 'created_by_email') # Explicitly add if editable=False isn't enough for some views

class GatePassItemInline(admin.TabularInline):
    model = GatePassItem
    extra = 1
    fields = ('sno', 'itemName', 'description', 'quantity', 'remarks')

@admin.register(GatePass)
class GatePassAdmin(admin.ModelAdmin):
    list_display = (
        'recipient_name', 
        'location', 
        'pass_date', 
        'prepared_by', 
        'approved_by', 
        'created_by_name', 
        'created_by_email',
        'created_at'
    )
    list_filter = ('location', 'pass_date', 'prepared_by', 'approved_by', 'created_by_name', 'created_by_email')
    search_fields = ('location__name', 'recipient_name', 'prepared_by', 'approved_by', 'items__itemName', 'created_by_name', 'created_by_email')
    inlines = [GatePassItemInline]
    date_hierarchy = 'pass_date' 
    
    fieldsets = (
        ("Recipient Details", {
            'fields': ('location', 'recipient_name', 'recipient_address', 'pass_date') 
        }),
        ("Approval Information", {
            'fields': ('prepared_by', 'received_by', 'approved_by')
        }),
        ("Record Creator Information", { 
            'fields': ('created_by_name', 'created_by_email'),
            'classes': ('collapse',), 
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',) 
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'created_by_name', 'created_by_email') # Explicitly add
