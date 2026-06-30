from django.urls import path

from . import views

urlpatterns = [
    path("groups/", views.GroupCreateView.as_view(), name="group-create"),
    path(
        "groups/<uuid:admin_token>/",
        views.GroupDetailView.as_view(),
        name="group-detail",
    ),
    path(
        "groups/<uuid:admin_token>/participants/",
        views.ParticipantListCreateView.as_view(),
        name="participant-create",
    ),
    path(
        "groups/<uuid:admin_token>/participants/<uuid:participant_id>/",
        views.ParticipantDeleteView.as_view(),
        name="participant-delete",
    ),
    path(
        "groups/<uuid:admin_token>/draw/",
        views.DrawView.as_view(),
        name="group-draw",
    ),
    path(
        "reveal/<uuid:participant_token>/",
        views.RevealView.as_view(),
        name="reveal",
    ),
]
