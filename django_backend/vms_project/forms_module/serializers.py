from rest_framework import serializers
from .models import DeviceStorageEntry, DeviceStorageItem, GatePass, GatePassItem

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
        
        # Update DeviceStorageEntry fields
        instance.company_name = validated_data.get('company_name', instance.company_name)
        instance.date = validated_data.get('date', instance.date)
        # ... update other fields similarly
        instance.submitter_name = validated_data.get('submitter_name', instance.submitter_name)
        # ...
        instance.save()

        if items_data is not None:
            # Simple approach: delete existing items and create new ones
            # For more complex scenarios, you might want to match by ID and update/create/delete
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

    class Meta:
        model = GatePass
        fields = [
            'id', 'recipient_name', 'recipient_address', 'items',
            'prepared_by', 'received_by', 'approved_by',
            'pass_date', 'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'pass_date', 'created_at', 'updated_at')

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        gate_pass = GatePass.objects.create(**validated_data)
        for item_data in items_data:
            GatePassItem.objects.create(gate_pass=gate_pass, **item_data)
        return gate_pass
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        instance.recipient_name = validated_data.get('recipient_name', instance.recipient_name)
        # ... update other fields
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                GatePassItem.objects.create(gate_pass=instance, **item_data)
        
        return instance