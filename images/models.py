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
    sha256 = models.CharField(max_length=64, null=True, blank=True, db_index=True)
    phash = models.CharField(max_length=16, null=True, blank=True, db_index=True)
    # When set, this image was merged into another (its duplicate). Such rows are
    # hidden from all listings but kept so re-imports don't re-create them.
    merged_into = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="merged_from",
    )


class DismissedDuplicate(models.Model):
    """A pair of images a user marked as *not* duplicates. The edge between them
    is skipped when building clusters, so the false positive stops reappearing.
    Stored canonically with image_a.id < image_b.id."""

    image_a = models.ForeignKey(Image, on_delete=models.CASCADE, related_name="+")
    image_b = models.ForeignKey(Image, on_delete=models.CASCADE, related_name="+")

    class Meta:
        unique_together = ("image_a", "image_b")
