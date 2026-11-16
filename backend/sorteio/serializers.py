from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import IntegrityError
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Group, Participant

WISHLIST_MAX_LENGTH = 1000
DUPLICATE_EMAIL_MESSAGE = "Já existe uma conta com este e-mail."


def find_user_by_email(email):
    """Conta pelo e-mail sem diferenciar maiúsculas (o e-mail também é o username)."""
    return (
        User.objects.filter(username=email).first()
        or User.objects.filter(username__iexact=email).first()
        or User.objects.filter(email__iexact=email).first()
    )


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", max_length=150)
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    class Meta:
        model = User
        fields = ["name", "email", "password"]

    def validate_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Informe o seu nome.")
        return value

    def validate_email(self, value):
        email = value.strip().lower()
        if find_user_by_email(email):
            raise serializers.ValidationError(DUPLICATE_EMAIL_MESSAGE)
        return email

    def validate(self, attrs):
        # Mesmas regras de senha do Django: tamanho mínimo, senhas comuns, só números, parecida com o nome.
        candidate = User(username=attrs["email"], email=attrs["email"], first_name=attrs["first_name"])
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)})
        return attrs

    def create(self, validated_data):
        try:
            return User.objects.create_user(
                username=validated_data["email"],
                email=validated_data["email"],
                password=validated_data["password"],
                first_name=validated_data["first_name"],
            )
        except IntegrityError:
            # Duas contas criadas ao mesmo tempo com o mesmo e-mail.
            raise serializers.ValidationError({"email": [DUPLICATE_EMAIL_MESSAGE]})


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Login pelo e-mail sem diferenciar maiúsculas: "Ana@Email.com" entra na conta de "ana@email.com"."""

    def validate(self, attrs):
        email = (attrs.get(self.username_field) or "").strip()
        user = find_user_by_email(email)
        attrs[self.username_field] = user.username if user else email
        return super().validate(attrs)

class ParticipantSerializer(serializers.ModelSerializer):
    reveal_url = serializers.SerializerMethodField()

    class Meta:
        model = Participant
        fields = [
            "id",
            "name",
            "wishlist",
            "token",
            "reveal_url",
            "link_sent_at",
            "viewed_at",
        ]
        read_only_fields = ["id", "token", "reveal_url", "link_sent_at", "viewed_at"]

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
            "event_date",
            "event_time",
            "location",
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
            return f"/grupos/{obj.admin_token}"
        return request.build_absolute_uri(f"/grupos/{obj.admin_token}")


class GroupWriteSerializer(serializers.ModelSerializer):
    """Criação e edição do grupo pelo organizador."""

    class Meta:
        model = Group
        fields = ["name", "description", "budget", "event_date", "event_time", "location"]

    def validate(self, attrs):
        event_date = attrs.get("event_date", getattr(self.instance, "event_date", None))
        event_time = attrs.get("event_time", getattr(self.instance, "event_time", None))
        if event_time and not event_date:
            raise serializers.ValidationError(
                {"event_date": "Informe a data da festa junto com o horário."}
            )
        return attrs


class ParticipantCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Participant
        fields = ["name", "wishlist"]
        extra_kwargs = {"wishlist": {"max_length": WISHLIST_MAX_LENGTH}}

    def validate_name(self, value):
        return value.strip()


class WishlistSerializer(serializers.Serializer):
    wishlist = serializers.CharField(
        allow_blank=True,
        max_length=WISHLIST_MAX_LENGTH,
        error_messages={
            "max_length": f"A lista de desejos pode ter no máximo {WISHLIST_MAX_LENGTH} caracteres.",
        },
    )
