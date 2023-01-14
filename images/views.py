import os
import random
from django.http import FileResponse, HttpResponse
from django.shortcuts import redirect, render

from images.models import Image, Tag


def index(request):
    images = list(Image.objects.all())
    random.shuffle(images)
    return render(
        request, "images/image_list.html", {"title": "Homepage", "images": images[:30]}
    )


def show(request, image_id: int):
    image = Image.objects.get(id=image_id)

    tags = [
        (tag, image.tags.contains(tag))
        for tag in sorted(Tag.objects.all(), key=lambda t: t.name)
    ]
    tags = sorted(tags, key=lambda v: 0 if v[1] else 1)

    return render(request, "images/show.html", {"image": image, "tags": tags})


def data(request, image_id: int):
    image = Image.objects.get(id=image_id)
    return FileResponse(open(os.path.join(image.repository.path, image.filename), "rb"))


def create_tag(request):
    initial_image = Image.objects.get(id=int(request.POST["initial_image_id"]))
    tag_name = request.POST["tag_name"]

    tag, _ = Tag.objects.get_or_create(name=tag_name)

    if not initial_image.tags.contains(tag):
        initial_image.tags.add(tag)

    return redirect("show", image_id=initial_image.id)


def add_tag(request, image_id: int, tag_id: int):
    image = Image.objects.get(id=image_id)
    tag = Tag.objects.get(id=tag_id)

    image.tags.add(tag)

    return redirect("show", image_id=image.id)


def remove_tag(request, image_id: int, tag_id: int):
    image = Image.objects.get(id=image_id)
    tag = Tag.objects.get(id=tag_id)

    image.tags.remove(tag)

    return redirect("show", image_id=image.id)


def tags_index(request):
    return render(request, "images/tags_list.html", {"tags": Tag.objects.all()})


def tags_show(request, tag_id: int):
    tag = Tag.objects.get(id=tag_id)
    return render(
        request,
        "images/image_list.html",
        {"title": tag.name, "images": tag.image_set.all()},
    )
