from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth.models import User

from .models import Group, Participant
from .serializers import (
    RegisterSerializer,
    GroupCreateSerializer,
    GroupSerializer,
    ParticipantCreateSerializer,
    ParticipantSerializer,
    RevealSerializer,
)
from .services import DrawError, perform_draw


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer


from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Group, Participant, UserProfile

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        
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

    def put(self, request):
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)

        name = request.data.get('name')
        if name is not None:
            user.first_name = name

        email = request.data.get('email')
        if email is not None:
            user.email = email
            user.username = email

        new_password = request.data.get('new_password')
        current_password = request.data.get('current_password')
        if new_password:
            if not current_password or not user.check_password(current_password):
                return Response({"detail": "Senha atual incorreta."}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()

        phone = request.data.get('phone')
        if phone is not None:
            profile.phone = phone

        if 'avatar' in request.FILES:
            profile.avatar = request.FILES['avatar']

        profile.save()

        return self.get(request)


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
        serializer = GroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save(owner=request.user)
        return Response(
            GroupSerializer(group, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class GroupDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, admin_token):
        try:
            group = Group.objects.prefetch_related("participants").get(
                admin_token=admin_token, owner=request.user
            )
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        return Response(
            GroupSerializer(group, context={"request": request}).data
        )


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


class ParticipantDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, admin_token, participant_id):
        try:
            group = Group.objects.get(admin_token=admin_token, owner=request.user)
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        if group.is_drawn:
            return Response(
                {"detail": "Não é possível remover participantes após o sorteio."},
                status=400,
            )

        try:
            participant = group.participants.get(id=participant_id)
        except Participant.DoesNotExist:
            return Response({"detail": "Participante não encontrado."}, status=404)

        participant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DrawView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, admin_token):
        try:
            group = Group.objects.prefetch_related("participants").get(
                admin_token=admin_token, owner=request.user
            )
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        try:
            perform_draw(group)
        except DrawError as exc:
            return Response({"detail": str(exc)}, status=400)

        group.refresh_from_db()
        return Response(
            GroupSerializer(group, context={"request": request}).data
        )


class RevealView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, participant_token):
        try:
            participant = Participant.objects.select_related(
                "group", "assigned_to"
            ).get(token=participant_token)
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

        data = {
            "participant_name": participant.name,
            "group_name": participant.group.name,
            "group_description": participant.group.description,
            "budget": participant.group.budget,
            "assigned_name": participant.assigned_to.name,
            "assigned_wishlist": participant.assigned_to.wishlist,
        }
        return Response(RevealSerializer(data).data)
