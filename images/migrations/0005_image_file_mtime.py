# Generated by Django 4.1.5 on 2023-01-14 15:55

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("images", "0004_image_views"),
    ]

    operations = [
        migrations.AddField(
            model_name="image",
            name="file_mtime",
            field=models.DateTimeField(default=datetime.datetime.now),
        ),
    ]
