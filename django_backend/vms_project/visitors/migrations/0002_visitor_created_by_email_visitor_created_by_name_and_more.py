# Generated by Django 4.2.21 on 2025-06-24 08:05

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('locations', '0001_initial'),
        ('visitors', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='visitor',
            name='created_by_email',
            field=models.EmailField(blank=True, editable=False, help_text='Email of the user who created this entry.', max_length=254, null=True),
        ),
        migrations.AddField(
            model_name='visitor',
            name='created_by_name',
            field=models.CharField(blank=True, editable=False, help_text='Full name of the user who created this entry.', max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='visitor',
            name='location',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.PROTECT, related_name='visitors', to='locations.location'),
            preserve_default=False,
        ),
    ]
