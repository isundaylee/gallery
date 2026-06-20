import os

from django.http import FileResponse

from images.models import Image


def data(request, image_id: int):
    """Serve the raw bytes of an image file. Used by the React frontend as
    the <img src> target via /api/images/<id>/data."""
    image = Image.objects.get(id=image_id)
    return FileResponse(open(os.path.join(image.repository.path, image.filename), "rb"))
