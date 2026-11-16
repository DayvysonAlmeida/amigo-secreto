import uuid

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    phone = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Group(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sorteio_groups", null=True, blank=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    budget = models.CharField(max_length=80, blank=True)
    # Dados da festa (opcionais). Data e horário separados e sem fuso:
    # "24/12 às 20h" é a hora local da festa para todo mundo.
    event_date = models.DateField(null=True, blank=True)
    event_time = models.TimeField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
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
    # Acompanhamento do envio: quando o organizador enviou/copiou o link
    # e quando o participante abriu o resultado pela primeira vez.
    link_sent_at = models.DateTimeField(null=True, blank=True)
    viewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["name"]
        unique_together = [("group", "name")]

    def __str__(self):
        return self.name
