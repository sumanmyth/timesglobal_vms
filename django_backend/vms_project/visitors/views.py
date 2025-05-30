from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend # For more advanced filtering
from .models import Visitor
from .serializers import VisitorSerializer, VisitorCheckoutSerializer

class VisitorFilter(filters.BaseFilterBackend):
    """
    Custom filter for check_in_time_after and check_in_time_before.
    DRF's SearchFilter is good for `search=` param.
    For date ranges, a custom filter or django-filter is better.
    """
    def filter_queryset(self, request, queryset, view):
        check_in_after = request.query_params.get('check_in_time_after', None)
        check_in_before = request.query_params.get('check_in_time_before', None)
        
        if check_in_after:
            queryset = queryset.filter(checkInTime__date__gte=check_in_after)
        if check_in_before:
            # To include the whole day of 'check_in_before', you might need to adjust this logic
            # e.g., if 'check_in_before' is '2023-10-27', this filters for checkInTime up to that date's start.
            # If you mean to include the full day, you'd filter checkInTime__date__lte=check_in_before
            queryset = queryset.filter(checkInTime__date__lte=check_in_before) 
            # Example for including the full day:
            # from datetime import datetime, timedelta
            # if check_in_before:
            #     end_date = datetime.strptime(check_in_before, '%Y-%m-%d') + timedelta(days=1)
            #     queryset = queryset.filter(checkInTime__lt=end_date)

        return queryset


class VisitorViewSet(viewsets.ModelViewSet):
    queryset = Visitor.objects.all().order_by('-checkInTime')
    serializer_class = VisitorSerializer
    filter_backends = [filters.SearchFilter, VisitorFilter, DjangoFilterBackend]
    search_fields = ['fullName', 'idNumberType', 'email', 'contact'] # For '?search='
    filterset_fields = ['fullName', 'email', 'checkInTime'] # For specific field filtering if using DjangoFilterBackend

    def get_serializer_class(self):
        if self.action == 'checkout':
            return VisitorCheckoutSerializer
        return super().get_serializer_class()

    @action(detail=True, methods=['patch', 'post'], url_path='checkout')
    def checkout(self, request, pk=None):
        visitor = self.get_object()
        if visitor.checkOutTime:
            return Response({'detail': 'Visitor already checked out.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update checkOutTime to now
        visitor.checkOutTime = timezone.now()
        visitor.save()
        
        serializer = VisitorSerializer(visitor) # Return full visitor data
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='report')
    def report(self, request):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response({'detail': 'Both start_date and end_date parameters are required.'}, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Ensure dates are handled correctly, for instance, end_date should cover the whole day
            from datetime import datetime, timedelta
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').replace(hour=0, minute=0, second=0)
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').replace(hour=23, minute=59, second=59)
            
            # If you want end_date to be exclusive for the next day's start:
            # end_date_exclusive = datetime.strptime(end_date_str, '%Y-%m-%d') + timedelta(days=1)
            # queryset = Visitor.objects.filter(checkInTime__gte=start_date, checkInTime__lt=end_date_exclusive)

        except ValueError:
            return Response({'detail': 'Invalid date format. Please use YYYY-MM-DD.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        queryset = Visitor.objects.filter(
            checkInTime__gte=start_date, 
            checkInTime__lte=end_date # inclusive of the end_date
        ).order_by('checkInTime')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)