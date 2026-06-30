from django.contrib import admin

from .models import Group, Participant


class ParticipantInline(admin.TabularInline):
    model = Participant
    extra = 0
    readonly_fields = ("token", "assigned_to")


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ("name", "is_drawn", "created_at")
    search_fields = ("name",)
    readonly_fields = ("admin_token", "created_at")
    inlines = [ParticipantInline]


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ("name", "group", "assigned_to")
    search_fields = ("name",)
    readonly_fields = ("token",)
