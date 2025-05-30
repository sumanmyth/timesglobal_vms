from django.contrib import admin
from .models import StoredImage
from django.utils.html import format_html

@admin.register(StoredImage)
class StoredImageAdmin(admin.ModelAdmin):
    list_display = ('fullName', 'idType', 'contact', 'email', 'image_preview', 'uploaded_at', 'updated_at') # Added contact and email
    list_filter = ('idType', 'uploaded_at')
    search_fields = ('fullName', 'idType', 'contact', 'email') # Added contact and email
    readonly_fields = ('image_preview_large', 'uploaded_at', 'updated_at')
    fields = ('fullName', 'contact', 'email', 'idType', 'imageFile', 'image_preview_large', 'uploaded_at', 'updated_at') # Added contact and email

    def image_preview(self, obj):
        if obj.imageFile:
            return format_html('<img src="{}" style="max-height: 50px; max-width: 50px;" />', obj.imageFile.url)
        return "No Image"
    image_preview.short_description = 'Image Preview'

    def image_preview_large(self, obj):
        if obj.imageFile:
            return format_html('<img src="{}" style="max-height: 200px; max-width: 200px;" />', obj.imageFile.url)
        return "No Image Available"
    image_preview_large.short_description = 'Current Image Preview'