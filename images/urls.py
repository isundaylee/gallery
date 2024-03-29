from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:image_id>", views.show, name="show"),
    path("<int:image_id>/data", views.data, name="data"),
    path("create_tag", views.create_tag, name="create_tag"),
    path("add_tag/<int:image_id>/<int:tag_id>", views.add_tag, name="add_tag"),
    path("remove_tag/<int:image_id>/<int:tag_id>", views.remove_tag, name="remove_tag"),
    path("tags", views.tags_index, name="tags_index"),
    path("tags/<int:tag_id>", views.tags_show, name="tags_show"),
    path("recent", views.recent, name="recent"),
    path("recent/<int:page>", views.recent, name="recent"),
]
