from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    # Add any custom configurations for the User model in the admin panel
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    # If you add custom fields to User model, you might want to add them to fieldsets
    # fieldsets = BaseUserAdmin.fieldsets + (
    #     (None, {'fields': ('custom_field1', 'custom_field2')}),
    # )
    # add_fieldsets = BaseUserAdmin.add_fieldsets + (
    #     (None, {'fields': ('custom_field1', 'custom_field2')}),
    # )

admin.site.register(User, UserAdmin)