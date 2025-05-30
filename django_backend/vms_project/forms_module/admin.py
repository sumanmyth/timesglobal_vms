from django.contrib import admin
from .models import DeviceStorageEntry, DeviceStorageItem, GatePass, GatePassItem

class DeviceStorageItemInline(admin.TabularInline):
    model = DeviceStorageItem
    extra = 1 # Number of empty forms to display
    fields = ('sno', 'quantity', 'description', 'rackNo', 'remarks')

@admin.register(DeviceStorageEntry)
class DeviceStorageEntryAdmin(admin.ModelAdmin):
    list_display = ('submitter_name', 'date', 'company_name', 'submitter_company_name', 'created_at')
    list_filter = ('date', 'company_name', 'submitter_company_name')
    search_fields = ('submitter_name', 'company_name', 'items__description')
    inlines = [DeviceStorageItemInline]
    date_hierarchy = 'date'
    fieldsets = (
        ("Entry Details", {
            'fields': ('company_name', 'date', 'office_address')
        }),
        ("Submitter Information", {
            'fields': ('submitter_name', 'submitter_company_name', 'submitter_designation', 'submitter_contact')
        }),
        ("Signatures", {
            'fields': ('submitter_signature', 'prepared_by_signature')
        }),
        ("Timestamps", {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('created_at', 'updated_at')

class GatePassItemInline(admin.TabularInline):
    model = GatePassItem
    extra = 1
    fields = ('sno', 'itemName', 'description', 'quantity', 'remarks')

@admin.register(GatePass)
class GatePassAdmin(admin.ModelAdmin):
    list_display = ('recipient_name', 'pass_date', 'prepared_by', 'approved_by', 'created_at')
    list_filter = ('pass_date', 'prepared_by', 'approved_by')
    search_fields = ('recipient_name', 'prepared_by', 'approved_by', 'items__itemName')
    inlines = [GatePassItemInline]
    date_hierarchy = 'pass_date'
    fieldsets = (
        ("Recipient Details", {
            'fields': ('recipient_name', 'recipient_address')
        }),
        ("Approval Information", {
            'fields': ('prepared_by', 'received_by', 'approved_by')
        }),
        ("Timestamps", {
            'fields': ('pass_date', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('pass_date', 'created_at', 'updated_at') # pass_date is auto