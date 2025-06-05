# django_backend/vms_project/task_management/views.py
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Task
from .serializers import TaskSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filter_backends = [
        DjangoFilterBackend, 
        filters.SearchFilter, 
        filters.OrderingFilter
    ]
    
    filterset_fields = {
        'job_date': ['exact', 'gte', 'lte', 'range'],
        'job_id': ['exact', 'icontains'],
        'job_title': ['icontains'],
        'full_name': ['icontains'],
        'company_name': ['exact', 'icontains'],
        'rack_number': ['exact', 'icontains'],
        'encoded_by': ['exact', 'icontains'],
        'is_completed': ['exact'], # Allow filtering by completion status
    }
    
    search_fields = [
        'job_id', 
        'job_title', 
        'full_name', 
        'company_name', 
        'rack_number', 
        'encoded_by',
        'job_description',
        'contact'
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

    def perform_update(self, serializer):
        instance = serializer.instance
        is_completing = serializer.validated_data.get('is_completed', instance.is_completed)
        
        if is_completing and not instance.is_completed: # Marking as completed
            serializer.save(completed_at=timezone.now())
        elif not is_completing and instance.is_completed: # Marking as not completed
            serializer.save(completed_at=None)
        else: # No change in completion status, or already completed and still completed
            serializer.save()

    @action(detail=False, methods=['get'], url_path='completed-today-count')
    def completed_today_count(self, request):
        today = timezone.now().date()
        count = Task.objects.filter(is_completed=True, completed_at__date=today).count()
        return Response({'count': count}, status=status.HTTP_200_OK)