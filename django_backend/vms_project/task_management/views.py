# <<<< START OF FILE task_management/views.py >>>>
from rest_framework import viewsets, filters as drf_filters, status # Renamed 'filters' to avoid conflict
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer
# Import the BaseLocationScopedViewSet from forms_module or a common module
# Assuming it's in forms_module for now as per previous context
from forms_module.views import BaseLocationScopedViewSet 

class TaskViewSet(BaseLocationScopedViewSet): # Inherit from BaseLocationScopedViewSet
    queryset = Task.objects.all().order_by('-created_at') # Base queryset
    serializer_class = TaskSerializer
    filter_backends = [
        DjangoFilterBackend, 
        drf_filters.SearchFilter, 
        drf_filters.OrderingFilter
    ]
    
    filterset_fields = {
        'job_date': ['exact', 'gte', 'lte', 'range'],
        # 'job_id': ['exact', 'icontains'], # job_id might not be as useful for filtering if purely sequential
        'job_title': ['icontains'],
        'full_name': ['icontains'],
        'company_name': ['exact', 'icontains'],
        'rack_number': ['exact', 'icontains'],
        'encoded_by': ['exact', 'icontains'],
        'is_completed': ['exact'], 
        'created_by_name': ['icontains'],
        'created_by_email': ['exact', 'icontains'],
        'created_at': ['exact', 'gte', 'lte', 'range'], # Ensure 'created_at' is filterable
    }
    
    search_fields = [
        'job_id', 
        'job_title', 
        'full_name', 
        'company_name', 
        'rack_number', 
        'encoded_by',
        'job_description',
        'contact',
        'created_by_name',
        'created_by_email',
    ]
    
    ordering_fields = [
        'job_date', 
        'job_id', 
        'job_title', 
        'full_name', 
        'company_name', 
        'created_at',
        'is_completed',
        'completed_at',
    ]

    # perform_create is inherited from BaseLocationScopedViewSet,
    # which handles location checks and setting created_by_name/email.
    # No need to override it here unless Task specific logic is needed for creation.

    def perform_update(self, serializer):
        instance = serializer.instance # Get the existing task instance
        
        # Check if 'is_completed' is being changed in the request payload
        is_completing_payload = serializer.validated_data.get('is_completed')

        # If is_completed is part of the payload and different from current state
        if is_completing_payload is not None and is_completing_payload != instance.is_completed:
            if is_completing_payload: # Marking as completed
                serializer.save(completed_at=timezone.now())
            else: # Marking as not completed (un-completing)
                serializer.save(completed_at=None)
        else: # No change in completion status in payload, or is_completed not in payload
            serializer.save()


    @action(detail=False, methods=['get'], url_path='completed-today-count')
    def completed_today_count(self, request):
        user = self.request.user
        location_id_filter = self.request.query_params.get('location_id')
        
        if not user.is_approved_by_admin:
            return Response({'count': 0, 'detail': 'User not approved'}, status=status.HTTP_403_FORBIDDEN)

        authorized_location_ids = user.authorized_locations.values_list('id', flat=True)
        if not authorized_location_ids:
            return Response({'count': 0, 'detail': 'No authorized locations'}, status=status.HTTP_403_FORBIDDEN)

        query_filters = {'is_completed': True, 'completed_at__date': timezone.now().date()}
        
        if location_id_filter:
            try:
                location_id_filter_int = int(location_id_filter)
                if location_id_filter_int not in authorized_location_ids:
                    return Response({'count': 0, 'detail': 'Not authorized for this location'}, status=status.HTTP_403_FORBIDDEN)
                query_filters['location_id'] = location_id_filter_int
            except ValueError:
                 return Response({'count': 0, 'detail': 'Invalid location_id format.'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # If no specific location, count for all authorized locations by default for this specific action
            # Or, you could require a location_id if that's preferred.
            query_filters['location_id__in'] = authorized_location_ids
            
        count = Task.objects.filter(**query_filters).count()
        return Response({'count': count}, status=status.HTTP_200_OK)

# <<<< END OF FILE task_management/views.py >>>>