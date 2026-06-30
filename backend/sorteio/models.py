import uuid

from django.db import models


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    budget = models.CharField(max_length=80, blank=True)
    admin_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_drawn = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Participant(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="participants"
    )
    name = models.CharField(max_length=120)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    wishlist = models.TextField(blank=True)
    assigned_to = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="assigned_by",
    )

    class Meta:
        ordering = ["name"]
        unique_together = [("group", "name")]

    def __str__(self):
        return self.name
