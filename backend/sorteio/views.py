from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email

from .models import Group, Participant
from .serializers import (
    DUPLICATE_EMAIL_MESSAGE,
    find_user_by_email,
    RegisterSerializer,
    GroupWriteSerializer,
    GroupSerializer,
    ParticipantCreateSerializer,
    ParticipantSerializer,
    WishlistSerializer,
)
from django.utils import timezone

from .services import DrawError, perform_draw, undo_draw


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Group, Participant, UserProfile

AVATAR_MAX_BYTES = 2 * 1024 * 1024
AVATAR_EXTENSIONS = {"jpg", "jpeg", "png", "webp", "gif"}


def avatar_error(file):
    """Só aceita imagens de verdade: a foto é servida no mesmo domínio do app,
    então um HTML disfarçado de foto poderia rodar código na página de quem abrisse."""
    if file.size > AVATAR_MAX_BYTES:
        return "A foto pode ter no máximo 2 MB."
    extension = file.name.rsplit(".", 1)[-1].lower() if "." in file.name else ""
    if extension not in AVATAR_EXTENSIONS:
        return "Envie a foto em JPG, PNG, WebP ou GIF."
    try:
        forms.ImageField().clean(file)
    except DjangoValidationError:
        return "Este arquivo não é uma imagem válida."
    return None


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def _payload(self, request, profile):
        user = request.user
        avatar_url = None
        if profile and profile.avatar:
            avatar_url = request.build_absolute_uri(profile.avatar.url)

        return Response({
            "id": user.id,
            "name": user.first_name,
            "email": user.email,
            "phone": profile.phone if profile else None,
            "avatar": avatar_url
        })

    def get(self, request):
        return self._payload(request, UserProfile.objects.filter(user=request.user).first())

    def put(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        def error(message):
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        # Valida tudo antes de salvar qualquer coisa (o Postgres também recusa textos longos demais).
        name = request.data.get("name")
        if name is not None:
            name = str(name).strip()
            if not name:
                return error("Informe o seu nome.")
            if len(name) > 150:
                return error("O nome pode ter no máximo 150 caracteres.")

        email = request.data.get("email")
        if email is not None:
            email = str(email).strip().lower()
            try:
                validate_email(email)
            except DjangoValidationError:
                return error("Informe um e-mail válido.")
            if len(email) > 150:
                return error("O e-mail pode ter no máximo 150 caracteres.")
            other = find_user_by_email(email)
            if other and other.pk != user.pk:
                return error(DUPLICATE_EMAIL_MESSAGE)

        phone = request.data.get("phone")
        if phone is not None:
            phone = str(phone).strip()
            if len(phone) > 20:
                return error("O telefone pode ter no máximo 20 caracteres.")

        new_password = request.data.get("new_password")
        if new_password:
            current_password = request.data.get("current_password")
            if not current_password or not user.check_password(current_password):
                return error("Senha atual incorreta.")
            try:
                validate_password(new_password, user=user)
            except DjangoValidationError as exc:
                return error(" ".join(exc.messages))

        avatar = request.FILES.get("avatar")
        if avatar:
            message = avatar_error(avatar)
            if message:
                return error(message)

        if name is not None:
            user.first_name = name
        if email is not None:
            user.email = email
            user.username = email
        if new_password:
            user.set_password(new_password)
        user.save()

        if phone is not None:
            profile.phone = phone
        if avatar:
            profile.avatar = avatar
        profile.save()

        return self._payload(request, profile)


class GroupListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        groups = Group.objects.filter(owner=request.user)
        return Response(
            GroupSerializer(groups, many=True, context={"request": request}).data
        )


class GroupCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GroupWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save(owner=request.user)
        return Response(
            GroupSerializer(group, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_group(self, request, admin_token):
        return Group.objects.prefetch_related("participants").get(
            admin_token=admin_token, owner=request.user
        )

    def get(self, request, admin_token):
        try:
            group = self._get_group(request, admin_token)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        return Response(
            GroupSerializer(group, context={"request": request}).data
        )

    def patch(self, request, admin_token):
        """Edita nome, descrição, valor e dados da festa (também depois do sorteio)."""
        try:
            group = self._get_group(request, admin_token)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        serializer = GroupWriteSerializer(group, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        group = self._get_group(request, admin_token)
        return Response(GroupSerializer(group, context={"request": request}).data)

    def delete(self, request, admin_token):
        try:
            group = Group.objects.get(admin_token=admin_token, owner=request.user)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ParticipantListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_group(self, admin_token, user):
        return Group.objects.get(admin_token=admin_token, owner=user)

    def post(self, request, admin_token):
        try:
            group = self._get_group(admin_token, request.user)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        if group.is_drawn:
            return Response(
                {"detail": "Não é possível adicionar participantes após o sorteio."},
                status=400,
            )

        serializer = ParticipantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]
        if group.participants.filter(name__iexact=name).exists():
            return Response(
                {"detail": "Já existe um participante com este nome."},
                status=400,
            )

        participant = Participant.objects.create(group=group, **serializer.validated_data)
        return Response(
            ParticipantSerializer(participant, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ParticipantDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get(self, request, admin_token, participant_id):
        group = Group.objects.get(admin_token=admin_token, owner=request.user)
        return group, group.participants.get(id=participant_id)

    def patch(self, request, admin_token, participant_id):
        """Corrige nome ou lista de desejos. Pode ser feito depois do sorteio:
        o resultado não muda, só o nome exibido."""
        try:
            group, participant = self._get(request, admin_token, participant_id)
        except (Group.DoesNotExist, Participant.DoesNotExist):
            return Response({"detail": "Participante não encontrado."}, status=404)

        serializer = ParticipantCreateSerializer(participant, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data.get("name")
        if name and group.participants.filter(name__iexact=name).exclude(id=participant.id).exists():
            return Response(
                {"detail": "Já existe um participante com este nome."},
                status=400,
            )

        serializer.save()
        return Response(
            ParticipantSerializer(participant, context={"request": request}).data
        )

    def delete(self, request, admin_token, participant_id):
        try:
            group, participant = self._get(request, admin_token, participant_id)
        except (Group.DoesNotExist, Participant.DoesNotExist):
            return Response({"detail": "Participante não encontrado."}, status=404)

        if group.is_drawn:
            return Response(
                {"detail": "Não é possível remover participantes após o sorteio."},
                status=400,
            )

        participant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ParticipantLinkSentView(APIView):
    """Marca que o organizador enviou (ou copiou) o link do participante."""

    permission_classes = [IsAuthenticated]

    def post(self, request, admin_token, participant_id):
        try:
            group = Group.objects.get(admin_token=admin_token, owner=request.user)
            participant = group.participants.get(id=participant_id)
        except (Group.DoesNotExist, Participant.DoesNotExist):
            return Response({"detail": "Participante não encontrado."}, status=404)

        if not group.is_drawn:
            return Response(
                {"detail": "Os links só ficam disponíveis após o sorteio."},
                status=400,
            )

        if participant.link_sent_at is None:
            participant.link_sent_at = timezone.now()
            participant.save(update_fields=["link_sent_at"])

        return Response(
            ParticipantSerializer(participant, context={"request": request}).data
        )


class DrawView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_group(self, request, admin_token):
        return Group.objects.prefetch_related("participants").get(
            admin_token=admin_token, owner=request.user
        )

    def _respond(self, request, group):
        group = self._get_group(request, group.admin_token)
        return Response(GroupSerializer(group, context={"request": request}).data)

    def post(self, request, admin_token):
        try:
            group = self._get_group(request, admin_token)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        try:
            perform_draw(group)
        except DrawError as exc:
            return Response({"detail": str(exc)}, status=400)

        return self._respond(request, group)

    def delete(self, request, admin_token):
        try:
            group = self._get_group(request, admin_token)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        try:
            undo_draw(group)
        except DrawError as exc:
            return Response({"detail": str(exc)}, status=400)

        return self._respond(request, group)


class RevealView(APIView):
    """Página pública do participante, acessada pelo link pessoal.

    GET   -> dados do grupo e a própria lista de desejos (sem o resultado).
    POST  -> revela quem a pessoa tirou e marca o link como visto.
    PATCH -> a pessoa atualiza a própria lista de desejos.
    """

    permission_classes = [AllowAny]
    # O link é público: um token JWT vencido no navegador (ex.: o organizador
    # testando o link) não pode transformar a página em erro 401.
    authentication_classes = []

    def _get_participant(self, participant_token):
        return Participant.objects.select_related("group", "assigned_to").get(
            token=participant_token
        )

    def _payload(self, participant, reveal=False):
        group = participant.group
        data = {
            "participant_name": participant.name,
            "group_name": group.name,
            "group_description": group.description,
            "budget": group.budget,
            "event_date": group.event_date.isoformat() if group.event_date else None,
            "event_time": group.event_time.strftime("%H:%M") if group.event_time else None,
            "location": group.location,
            "is_drawn": group.is_drawn,
            "has_viewed": participant.viewed_at is not None,
            "wishlist": participant.wishlist,
        }
        if reveal:
            data["assigned_name"] = participant.assigned_to.name
            data["assigned_wishlist"] = participant.assigned_to.wishlist
        return data

    def get(self, request, participant_token):
        try:
            participant = self._get_participant(participant_token)
        except Participant.DoesNotExist:
            return Response({"detail": "Link inválido."}, status=404)
        return Response(self._payload(participant))

    def post(self, request, participant_token):
        try:
            participant = self._get_participant(participant_token)
        except Participant.DoesNotExist:
            return Response({"detail": "Link inválido."}, status=404)

        if not participant.group.is_drawn:
            return Response(
                {"detail": "O sorteio ainda não foi realizado."},
                status=400,
            )

        if not participant.assigned_to:
            return Response(
                {"detail": "Sorteio incompleto. Contate o organizador."},
                status=400,
            )

        if participant.viewed_at is None:
            participant.viewed_at = timezone.now()
            participant.save(update_fields=["viewed_at"])

        return Response(self._payload(participant, reveal=True))

    def patch(self, request, participant_token):
        try:
            participant = self._get_participant(participant_token)
        except Participant.DoesNotExist:
            return Response({"detail": "Link inválido."}, status=404)

        serializer = WishlistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participant.wishlist = serializer.validated_data["wishlist"]
        participant.save(update_fields=["wishlist"])
        return Response(self._payload(participant))
