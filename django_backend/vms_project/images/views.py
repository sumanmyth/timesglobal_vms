from rest_framework import viewsets, filters, status
from rest_framework.parsers import MultiPartParser, FormParser # For file uploads
from rest_framework.response import Response
from .models import StoredImage
from .serializers import StoredImageSerializer

class StoredImageViewSet(viewsets.ModelViewSet):
    queryset = StoredImage.objects.all().order_by('-uploaded_at')
    serializer_class = StoredImageSerializer
    parser_classes = (MultiPartParser, FormParser) # To handle image uploads
    filter_backends = [filters.SearchFilter]
    search_fields = ['fullName', 'idType'] # For '?search=' query parameter

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        # If imageFile is not part of request.data, it won't be updated/cleared by default.
        # If you want to allow partial updates without re-uploading image, this is fine.
        # If you always expect an image on update, or want to clear it, add logic.
        partial = kwargs.pop('partial', False) # True for PATCH, False for PUT
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)