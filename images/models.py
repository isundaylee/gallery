from django.db import models


class Repository(models.Model):
    name = models.CharField(max_length=100, unique=True)
    path = models.CharField(max_length=300)


class Image(models.Model):
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)
    filename = models.CharField(max_length=300)
