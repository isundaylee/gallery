import json
import random

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from images.models import Image, Tag


def _image_dict(image):
    return {"id": image.id, "filename": image.filename, "views": image.views}


def images_index(request):
    """List images. Supports ?mode=random|recent, ?page=N, ?tag=<id>."""
    tag_id = request.GET.get("tag")
    if tag_id is not None:
        tag = Tag.objects.get(id=int(tag_id))
        images = list(tag.image_set.all())
        title = tag.name
    elif request.GET.get("mode") == "recent":
        page = int(request.GET.get("page", 0))
        images = list(Image.objects.order_by("import_time").reverse())
        images = images[30 * page : 30 * (page + 1)]
        title = "Recent"
    else:
        images = list(Image.objects.all())
        random.shuffle(images)
        images = images[:30]
        title = "Homepage"

    return JsonResponse(
        {"title": title, "images": [_image_dict(i) for i in images]}
    )


def images_show(request, image_id: int):
    """Image detail with all tags annotated by whether they are applied."""
    image = Image.objects.get(id=image_id)

    image.views += 1
    image.save()

    applied_ids = set(image.tags.values_list("id", flat=True))
    tags = [
        {"id": tag.id, "name": tag.name, "applied": tag.id in applied_ids}
        for tag in sorted(Tag.objects.all(), key=lambda t: t.name)
    ]
    tags.sort(key=lambda t: 0 if t["applied"] else 1)

    return JsonResponse({"image": _image_dict(image), "tags": tags})


@csrf_exempt
@require_http_methods(["POST"])
def image_tags(request, image_id: int):
    """Attach a tag to an image, by existing tag_id or by (new) name."""
    image = Image.objects.get(id=image_id)
    body = json.loads(request.body or "{}")

    if body.get("tag_id") is not None:
        tag = Tag.objects.get(id=int(body["tag_id"]))
    else:
        tag, _ = Tag.objects.get_or_create(name=body["name"])

    image.tags.add(tag)
    return JsonResponse({"id": tag.id, "name": tag.name})


@csrf_exempt
@require_http_methods(["DELETE"])
def image_tag_detail(request, image_id: int, tag_id: int):
    """Detach a tag from an image."""
    image = Image.objects.get(id=image_id)
    image.tags.remove(Tag.objects.get(id=tag_id))
    return JsonResponse({"ok": True})


def tags_index(request):
    tags = sorted(Tag.objects.all(), key=lambda t: t.name)
    return JsonResponse(
        {
            "tags": [
                {"id": t.id, "name": t.name, "count": t.image_set.count()}
                for t in tags
            ]
        }
    )


def review_index(request):
    """Unreviewed images (with their applied tag ids) plus all available tags."""
    images = Image.objects.filter(reviewed=False).order_by("-import_time")[:30]
    tags = sorted(Tag.objects.all(), key=lambda t: t.name)
    return JsonResponse(
        {
            "images": [
                {
                    "id": i.id,
                    "filename": i.filename,
                    "tag_ids": list(i.tags.values_list("id", flat=True)),
                }
                for i in images
            ],
            "tags": [{"id": t.id, "name": t.name} for t in tags],
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def review_mark(request):
    body = json.loads(request.body or "{}")
    image_ids = body.get("image_ids", [])
    Image.objects.filter(id__in=image_ids).update(reviewed=True)
    return JsonResponse({"ok": True})
