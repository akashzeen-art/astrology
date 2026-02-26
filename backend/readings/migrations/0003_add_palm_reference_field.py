# Generated migration to add palm_reference field for linking readings

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('readings', '0002_add_reading_type_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='reading',
            name='palm_reference',
            field=models.ForeignKey(
                'self',
                null=True,
                blank=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='derived_readings',
                help_text='Reference to the palm reading that this reading is based on (for numerology/astrology integration)',
            ),
        ),
        migrations.AddIndex(
            model_name='reading',
            index=models.Index(fields=['user', '-created_at'], name='readings_user_created_idx'),
        ),
        migrations.AddIndex(
            model_name='reading',
            index=models.Index(fields=['user', 'reading_type', '-created_at'], name='readings_user_type_created_idx'),
        ),
        migrations.AddIndex(
            model_name='reading',
            index=models.Index(fields=['status', '-created_at'], name='readings_status_created_idx'),
        ),
    ]

