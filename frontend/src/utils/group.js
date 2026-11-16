// Mesmo mínimo do backend (sorteio/services.py).
export const MIN_PARTICIPANTS = 3;

// Em que pé está o grupo e o que o organizador precisa fazer agora.
export const groupNextStep = (group) => {
  const participants = group.participants || [];
  const total = participants.length;

  if (!group.is_drawn) {
    if (total < MIN_PARTICIPANTS) {
      const missing = MIN_PARTICIPANTS - total;
      return {
        key: 'participants',
        title: total === 0
          ? 'Adicione os participantes'
          : `Falta${missing > 1 ? 'm' : ''} ${missing} ${missing > 1 ? 'pessoas' : 'pessoa'} para sortear`,
        text: `O sorteio precisa de pelo menos ${MIN_PARTICIPANTS} pessoas.`,
        action: 'Adicionar participantes',
      };
    }
    return {
      key: 'draw',
      title: 'Pronto para sortear',
      text: 'Está todo mundo na lista? Então é só sortear.',
      action: 'Fazer o sorteio',
      primary: true,
    };
  }

  // Quem já abriu o link recebeu o link, mesmo que o envio não tenha sido marcado.
  const sent = participants.filter((p) => p.link_sent_at || p.viewed_at).length;
  const viewed = participants.filter((p) => p.viewed_at).length;
  if (sent < total) {
    return {
      key: 'send',
      title: 'Envie os links',
      progress: { value: sent, total, label: `${sent} de ${total} links enviados` },
      action: 'Enviar links',
      primary: true,
    };
  }
  if (viewed < total) {
    return {
      key: 'wait',
      title: 'Falta gente abrir o link',
      progress: { value: viewed, total, label: `${viewed} de ${total} já viram quem tiraram` },
      action: 'Acompanhar',
    };
  }
  return {
    key: 'done',
    title: 'Tudo pronto!',
    text: 'Todo mundo já sabe quem tirou. Agora é só esperar a festa.',
    action: 'Ver grupo',
  };
};

// Conversão entre o grupo da API e os valores do formulário (GroupFields).

export const EMPTY_GROUP_VALUES = {
  name: '',
  description: '',
  budget: '',
  event_date: '',
  event_time: '',
  location: '',
};

export const groupToValues = (group) => ({
  name: group.name || '',
  description: group.description || '',
  budget: group.budget || '',
  event_date: group.event_date || '',
  event_time: (group.event_time || '').slice(0, 5),
  location: group.location || '',
});

export const valuesToPayload = (values) => ({
  name: values.name.trim(),
  description: values.description.trim(),
  budget: values.budget.trim(),
  event_date: values.event_date || null,
  // Horário sem data não faz sentido (o backend também recusa).
  event_time: values.event_date && values.event_time ? values.event_time : null,
  location: values.location.trim(),
});
