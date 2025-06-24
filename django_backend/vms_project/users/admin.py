# <<<< START OF FILE users/admin.py >>>>
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User
# from locations.models import Location # Import if you need to customize the widget further, but not strictly needed for filter_horizontal with string reference.

class UserAdmin(BaseUserAdmin):
    # Fields to display in the user list view
    list_display = (
        'username', 
        'email', 
        'first_name', 
        'last_name', 
        'is_staff', 
        'is_active', # Users can be active (can login)
        'is_approved_by_admin', # But might not be approved for dashboard
        'date_joined'
    )
    
    # Filters available in the sidebar
    list_filter = BaseUserAdmin.list_filter + ('is_approved_by_admin', 'authorized_locations')
    
    # Searchable fields
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Default ordering
    ordering = ('-date_joined',)
    
    # Fieldsets for the user edit form
    # We append our custom fields to the existing ones from BaseUserAdmin
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom User Permissions & Locations', { # Grouping custom fields
            'fields': ('is_approved_by_admin', 'authorized_locations')
        }),
    )
    
    # Fieldsets for the user creation form (add user)
    # We append our custom fields. Note that 'email' is often good to have here.
    # BaseUserAdmin.add_fieldsets usually contains ('username', 'password', 'password2')
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        (None, {
            'classes': ('wide',), # Optional styling class
            'fields': (
                'email', # Assuming email is distinct from username and required
                'first_name', 
                'last_name',
                'is_approved_by_admin', 
                'authorized_locations',
            ),
        }),
    )
    
    # Use filter_horizontal for a better UI for ManyToManyFields
    # 'user_permissions' is the correct field name from AbstractUser for user-specific permissions.
    # 'authorized_locations' is your custom ManyToManyField.
    filter_horizontal = ('groups', 'user_permissions', 'authorized_locations',)


admin.site.register(User, UserAdmin)

# <<<< END OF FILE users/admin.py >>>>