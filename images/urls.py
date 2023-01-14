from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:image_id>", views.show, name="show"),
    path("<int:image_id>/data", views.data, name="data"),
]
