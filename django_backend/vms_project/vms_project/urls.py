# <<<< START OF FILE vms_project/urls.py >>>>
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/locations/', include('locations.urls')), # Add locations URLs
    path('api/visitors/', include('visitors.urls')),
    path('api/', include('forms_module.urls')), # Keep this for device-storage and gate-passes
    path('api/images/', include('images.urls')),
    path('api/task-management/', include('task_management.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# <<<< END OF FILE vms_project/urls.py >>>>