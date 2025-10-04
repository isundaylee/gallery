import datetime

from django.db import models


class Repository(models.Model):
    name = models.CharField(max_length=100, unique=True)
    path = models.CharField(max_length=300)


class Tag(models.Model):
    name = models.CharField(max_length=100)


class Image(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    filename = models.CharField(max_length=300)
    tags = models.ManyToManyField(Tag)
    views = models.IntegerField(default=0)
    file_mtime = models.DateTimeField(default=datetime.datetime.now)
    import_time = models.DateTimeField(default=datetime.datetime.now)
    reviewed = models.BooleanField(default=False)
