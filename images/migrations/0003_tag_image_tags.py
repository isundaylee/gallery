# Generated by Django 4.1.5 on 2023-01-14 04:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("images", "0002_alter_repository_name"),
    ]

    operations = [
        migrations.CreateModel(
            name="Tag",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=100)),
            ],
        ),
        migrations.AddField(
            model_name="image",
            name="tags",
            field=models.ManyToManyField(to="images.tag"),
        ),
    ]