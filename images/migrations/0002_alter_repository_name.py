# Generated by Django 4.1.5 on 2023-01-14 02:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("images", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="repository",
            name="name",
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
