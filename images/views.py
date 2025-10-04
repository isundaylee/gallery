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


def recent(request, page: int = 0):
    images = list(Image.objects.order_by("import_time").reverse())
    return render(
        request,
        "images/image_list.html",
        {"title": "Recent", "images": images[30 * page : 30 * (page + 1)]},
    )


def show(request, image_id: int):
    image = Image.objects.get(id=image_id)

    image.views += 1
    image.save()

    tags = [
        (tag, image.tags.filter(id=tag.id).exists())
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

    if not initial_image.tags.filter(id=tag.id).exists():
        initial_image.tags.add(tag)

    return redirect("show", image_id=initial_image.id)


def add_tag(request, image_id: int, tag_id: int):
    image = Image.objects.get(id=image_id)
    tag = Tag.objects.get(id=tag_id)

    image.tags.add(tag)

    redirect_to = request.GET.get("redirect_to", "show")
    if redirect_to == "review":
        return redirect("review")
    return redirect("show", image_id=image.id)


def remove_tag(request, image_id: int, tag_id: int):
    image = Image.objects.get(id=image_id)
    tag = Tag.objects.get(id=tag_id)

    image.tags.remove(tag)

    redirect_to = request.GET.get("redirect_to", "show")
    if redirect_to == "review":
        return redirect("review")
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


def review(request):
    images = Image.objects.filter(reviewed=False).order_by("-import_time")[:30]
    tags = sorted(Tag.objects.all(), key=lambda t: t.name)
    return render(
        request, "images/review.html", {"images": images, "tags": tags}
    )


def mark_reviewed(request):
    if request.method == "POST":
        image_ids = request.POST.getlist("image_ids")
        Image.objects.filter(id__in=image_ids).update(reviewed=True)
    return redirect("review")
