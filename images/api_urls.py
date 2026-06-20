from django.urls import path

from . import api, views

urlpatterns = [
    path("images", api.images_index, name="api_images_index"),
    path("images/<int:image_id>", api.images_show, name="api_images_show"),
    path("images/<int:image_id>/data", views.data, name="api_images_data"),
    path("images/<int:image_id>/tags", api.image_tags, name="api_image_tags"),
    path(
        "images/<int:image_id>/tags/<int:tag_id>",
        api.image_tag_detail,
        name="api_image_tag_detail",
    ),
    path("tags", api.tags_index, name="api_tags_index"),
    path("review", api.review_index, name="api_review_index"),
    path("review/mark", api.review_mark, name="api_review_mark"),
]
