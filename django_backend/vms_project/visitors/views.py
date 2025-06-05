# django_backend/vms_project/visitors/views.py
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.utils.dateparse import parse_datetime # <--- ADD THIS IMPORT
from django_filters.rest_framework import DjangoFilterBackend 
from .models import Visitor
from .serializers import VisitorSerializer, VisitorCheckoutSerializer

# UPDATED VisitorFilter class
class VisitorFilter(filters.BaseFilterBackend):
    """
    Custom filter for check_in_time_after and check_in_time_before
    using ISO datetime strings.
    """
    def filter_queryset(self, request, queryset, view):
        check_in_after_str = request.query_params.get('check_in_time_after', None)
        check_in_before_str = request.query_params.get('check_in_time_before', None)
        
        if check_in_after_str:
            dt_after = parse_datetime(check_in_after_str)
            if dt_after:
                queryset = queryset.filter(checkInTime__gte=dt_after)
            # else: you could log a warning if parse_datetime returns None,
            # indicating an unexpected format from the client.
                
        if check_in_before_str:
            dt_before = parse_datetime(check_in_before_str)
            if dt_before:
                queryset = queryset.filter(checkInTime__lte=dt_before)
            # else: log warning for unexpected format.

        return queryset

class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().order_by('-checkInTime')
    serializer_class = VisitorSerializer
    filter_backends = [filters.SearchFilter, VisitorFilter, DjangoFilterBackend] # VisitorFilter is now the updated one
    search_fields = ['fullName', 'idNumberType', 'email', 'contact'] 
    filterset_fields = ['fullName', 'email', 'checkInTime'] 

    def get_serializer_class(self):
        if self.action == 'checkout':
            return VisitorCheckoutSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['patch', 'post'], url_path='checkout')
    def checkout(self, request, pk=None):
        visitor = self.get_object()
        if visitor.checkOutTime:
            return Response({'detail': 'Visitor already checked out.'}, status=status.HTTP_400_BAD_REQUEST)
        
        visitor.checkOutTime = timezone.now()
        visitor.save()
        
        serializer = VisitorSerializer(visitor) 
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='report')
    def report(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({'detail': 'Both start_date and end_date parameters are required.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from datetime import datetime # Ensure datetime is imported here too
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            
        except ValueError:
            return Response({'detail': 'Invalid date format. Please use YYYY-MM-DD.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        queryset = Visitor.objects.filter(
            checkInTime__gte=start_date, 
            checkInTime__lte=end_date 
        ).order_by('checkInTime')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)