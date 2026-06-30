from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Group, Participant
from .serializers import (
    GroupCreateSerializer,
    GroupSerializer,
    ParticipantCreateSerializer,
    ParticipantSerializer,
    RevealSerializer,
)
from .services import DrawError, perform_draw


class GroupCreateView(APIView):
    def post(self, request):
        serializer = GroupCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        group = serializer.save()
        return Response(
            GroupSerializer(group, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class GroupDetailView(APIView):
    def get(self, request, admin_token):
        try:
            group = Group.objects.prefetch_related("participants").get(
                admin_token=admin_token
            )
        except Group.DoesNotExist:
            return Response({"detail": "Grupo não encontrado."}, status=404)

        return Response(
            GroupSerializer(group, context={"request": request}).data
        )


class ParticipantListCreateView(APIView):
    def _get_group(self, admin_token):
        return Group.objects.get(admin_token=admin_token)

    def post(self, request, admin_token):
        try:
            group = self._get_group(admin_token)
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
    def delete(self, request, admin_token, participant_id):
        try:
            group = Group.objects.get(admin_token=admin_token)
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
    def post(self, request, admin_token):
        try:
            group = Group.objects.prefetch_related("participants").get(
                admin_token=admin_token
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
