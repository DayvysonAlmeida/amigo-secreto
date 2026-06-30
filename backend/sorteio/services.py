import random

from django.db import transaction

from .models import Group, Participant


class DrawError(Exception):
    pass


def _derangement_indices(size: int, max_attempts: int = 1000) -> list[int]:
    if size < 2:
        raise DrawError("É necessário pelo menos 2 participantes para sortear.")

    indices = list(range(size))
    for _ in range(max_attempts):
        random.shuffle(indices)
        if all(i != indices[i] for i in range(size)):
            return indices

    raise DrawError("Não foi possível realizar o sorteio. Tente novamente.")


@transaction.atomic
def perform_draw(group: Group) -> None:
    if group.is_drawn:
        raise DrawError("Este grupo já foi sorteado.")

    participants = list(group.participants.all())
    if len(participants) < 2:
        raise DrawError("É necessário pelo menos 2 participantes para sortear.")

    mapping = _derangement_indices(len(participants))
    for index, participant in enumerate(participants):
        participant.assigned_to = participants[mapping[index]]
        participant.save(update_fields=["assigned_to"])

    group.is_drawn = True
    group.save(update_fields=["is_drawn"])
