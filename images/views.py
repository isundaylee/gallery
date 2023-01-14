import os
import random
from django.http import FileResponse, HttpResponse
from django.shortcuts import render

from images.models import Image


def index(request):
    images = list(Image.objects.all())
    random.shuffle(images)
    return render(request, "images/image_list.html", {"images": images})


def data(request, image_id: int):
    image = Image.objects.get(id=image_id)
    return FileResponse(open(os.path.join(image.repository.path, image.filename), "rb"))
