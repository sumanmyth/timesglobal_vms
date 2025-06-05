from rest_framework import serializers
from .models import DeviceStorageEntry, DeviceStorageItem, GatePass, GatePassItem
from datetime import date, datetime # Ensure datetime is imported
from django.utils import timezone # For timezone.now().date()


# Device Storage Serializers
class DeviceStorageItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceStorageItem
        fields = ['sno', 'quantity', 'description', 'rackNo', 'remarks']

class DeviceStorageEntrySerializer(serializers.ModelSerializer):
    items = DeviceStorageItemSerializer(many=True)

    class Meta:
        model = DeviceStorageEntry
        fields = [
            'id', 'company_name', 'date', 'office_address', 'items',
            'submitter_name', 'submitter_company_name', 'submitter_designation',
            'submitter_contact', 'submitter_signature', 'prepared_by_signature',
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        entry = DeviceStorageEntry.objects.create(**validated_data)
        for item_data in items_data:
            DeviceStorageItem.objects.create(entry=entry, **item_data)
        return entry

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        instance.company_name = validated_data.get('company_name', instance.company_name)
        instance.date = validated_data.get('date', instance.date)
        instance.office_address = validated_data.get('office_address', instance.office_address)
        instance.submitter_name = validated_data.get('submitter_name', instance.submitter_name)
        instance.submitter_company_name = validated_data.get('submitter_company_name', instance.submitter_company_name)
        instance.submitter_designation = validated_data.get('submitter_designation', instance.submitter_designation)
        instance.submitter_contact = validated_data.get('submitter_contact', instance.submitter_contact)
        instance.submitter_signature = validated_data.get('submitter_signature', instance.submitter_signature)
        instance.prepared_by_signature = validated_data.get('prepared_by_signature', instance.prepared_by_signature)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                DeviceStorageItem.objects.create(entry=instance, **item_data)
        
        return instance


# Gate Pass Serializers
class GatePassItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GatePassItem
        fields = ['sno', 'itemName', 'description', 'quantity', 'remarks']

class GatePassSerializer(serializers.ModelSerializer):
    items = GatePassItemSerializer(many=True)
    
    # Use SerializerMethodField to ensure pass_date is handled as a date string
    pass_date = serializers.SerializerMethodField()

    class Meta:
        model = GatePass
        fields = [
            'id', 'recipient_name', 'recipient_address', 'items',
            'prepared_by', 'received_by', 'approved_by',
            'pass_date', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at') 

    def get_pass_date(self, obj):
        # The obj.pass_date from the model is already a date object
        # because models.DateField stores it as such.
        # We just need to format it.
        if isinstance(obj.pass_date, date):
            return obj.pass_date.isoformat() # Format as YYYY-MM-DD
        # Fallback if it's somehow still a datetime (shouldn't happen with DateField)
        if isinstance(obj.pass_date, datetime):
             return obj.pass_date.date().isoformat()
        return None


    def create(self, validated_data):
        items_data = validated_data.pop('items')
        # The model's `default=timezone.now` for `pass_date` handles setting it as a date.
        # When Django saves a DateField with timezone.now(), it correctly truncates to a date.
        gate_pass = GatePass.objects.create(**validated_data)
        for item_data in items_data:
            GatePassItem.objects.create(gate_pass=gate_pass, **item_data)
        return gate_pass
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        instance.recipient_name = validated_data.get('recipient_name', instance.recipient_name)
        instance.recipient_address = validated_data.get('recipient_address', instance.recipient_address)
        instance.prepared_by = validated_data.get('prepared_by', instance.prepared_by)
        instance.received_by = validated_data.get('received_by', instance.received_by)
        instance.approved_by = validated_data.get('approved_by', instance.approved_by)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                GatePassItem.objects.create(gate_pass=instance, **item_data)
        
        return instance