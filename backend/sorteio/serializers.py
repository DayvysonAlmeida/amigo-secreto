from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Group, Participant

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name")
    
    class Meta:
        model = User
        fields = ["name", "email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get("email"), 
            email=validated_data.get("email"),
            password=validated_data["password"],
            first_name=validated_data.get("first_name", "")
        )
        return user

class ParticipantSerializer(serializers.ModelSerializer):
    reveal_url = serializers.SerializerMethodField()

    class Meta:
        model = Participant
        fields = ["id", "name", "wishlist", "token", "reveal_url"]
        read_only_fields = ["id", "token", "reveal_url"]

    def get_reveal_url(self, obj):
        request = self.context.get("request")
        if not request:
            return f"/revelar/{obj.token}"
        return request.build_absolute_uri(f"/revelar/{obj.token}")


class GroupSerializer(serializers.ModelSerializer):
    participants = ParticipantSerializer(many=True, read_only=True)
    admin_url = serializers.SerializerMethodField()

    class Meta:
        model = Group
        fields = [
            "id",
            "name",
            "description",
            "budget",
            "admin_token",
            "is_drawn",
            "created_at",
            "participants",
            "admin_url",
        ]
        read_only_fields = [
            "id",
            "admin_token",
            "is_drawn",
            "created_at",
            "participants",
            "admin_url",
        ]

    def get_admin_url(self, obj):
        request = self.context.get("request")
        if not request:
            return f"/admin/{obj.admin_token}"
        return request.build_absolute_uri(f"/admin/{obj.admin_token}")


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ["name", "description", "budget"]


class ParticipantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ["name", "wishlist"]

    def validate_name(self, value):
        return value.strip()


class RevealSerializer(serializers.Serializer):
    participant_name = serializers.CharField()
    group_name = serializers.CharField()
    group_description = serializers.CharField()
    budget = serializers.CharField()
    assigned_name = serializers.CharField()
    assigned_wishlist = serializers.CharField()
