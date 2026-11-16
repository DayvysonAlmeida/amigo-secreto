import random

from django.db import transaction

from .models import Group, Participant

# Com 2 pessoas cada uma já sabe quem a outra tirou, então o mínimo é 3.
MIN_PARTICIPANTS = 3


class DrawError(Exception):
    pass


def _derangement_indices(size: int, max_attempts: int = 1000) -> list[int]:
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
    if len(participants) < MIN_PARTICIPANTS:
        raise DrawError(
            f"É necessário pelo menos {MIN_PARTICIPANTS} participantes para sortear."
        )

    mapping = _derangement_indices(len(participants))
    for index, participant in enumerate(participants):
        participant.assigned_to = participants[mapping[index]]
        participant.save(update_fields=["assigned_to"])

    group.is_drawn = True
    group.save(update_fields=["is_drawn"])


@transaction.atomic
def undo_draw(group: Group) -> None:
    """Apaga o resultado e destrava a lista. Os links (tokens) não mudam."""
    if not group.is_drawn:
        raise DrawError("Este grupo ainda não foi sorteado.")

    Participant.objects.filter(group=group).update(assigned_to=None, viewed_at=None)
    group.is_drawn = False
    group.save(update_fields=["is_drawn"])
