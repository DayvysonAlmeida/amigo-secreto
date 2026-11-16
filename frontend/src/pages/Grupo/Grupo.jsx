import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import {
  ArrowLeft, CalendarDays, Check, Copy, Eye, Gift, ListPlus, Lock, MapPin, MessageCircle, Pencil, Plus, RotateCcw, Send,
  Trash2, Users, Wallet,
} from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Input } from '../../components/Input/Input';
import { Avatar } from '../../components/Avatar/Avatar';
import { Badge } from '../../components/Badge/Badge';
import { ConfirmDialog, Modal } from '../../components/Modal/Modal';
import { GroupFields } from '../../components/GroupFields/GroupFields';
import {
  addParticipant, deleteGroup, drawGroup, getGroup, markLinkSent, removeParticipant, undoDraw, updateGroup, updateParticipant,
} from '../../api';
import { useToast } from '../../context/ToastContext';
import { errorMessage, formatBudget, formatEventDate, initials, mapsUrl } from '../../utils/format';
import { MIN_PARTICIPANTS, groupToValues, valuesToPayload } from '../../utils/group';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from './Grupo.module.css';

const STEPS = ['Participantes', 'Sorteio', 'Enviar links'];

const plural = (count, singular, pluralWord) => `${count} ${count === 1 ? singular : pluralWord}`;
const byName = (a, b) => a.name.localeCompare(b.name, 'pt-BR');
const revealUrl = (token) => `${window.location.origin}/revelar/${token}`;

const buildWhatsAppMessage = (participant, group) => {
  const lines = [
    `Oi, ${participant.name}! 🎁`,
    '',
    `O sorteio do amigo secreto *${group.name}* já foi feito.`,
    'Abra o seu link para descobrir quem você tirou (e não mostre pra ninguém!):',
    revealUrl(participant.token),
  ];
  const details = [];
  const when = formatEventDate(group.event_date, group.event_time);
  if (when) details.push(`Quando: ${when}`);
  if (group.location) details.push(`Onde: ${group.location}`);
  if (group.budget) details.push(`Valor sugerido: ${formatBudget(group.budget)}`);
  if (details.length) lines.push('', ...details);
  lines.push('', 'Pelo mesmo link você escreve a sua lista de desejos.');
  return lines.join('\n');
};

const linkStatus = (participant) => {
  if (participant.viewed_at) return { label: 'Viu o resultado', variant: 'success', Icon: Eye };
  if (participant.link_sent_at) return { label: 'Link enviado', variant: 'neutral', Icon: Send };
  return { label: 'Não enviado', variant: 'warning', Icon: null };
};

const Stepper = ({ current }) => (
  <ol className={styles.stepper} aria-label="Etapas do amigo secreto">
    {STEPS.map((label, index) => {
      const step = index + 1;
      const isDone = step < current;
      const isCurrent = step === current;
      return (
        <li
          key={label}
          className={clsx(styles.step, isDone && styles.stepDone, isCurrent && styles.stepCurrent)}
          aria-current={isCurrent ? 'step' : undefined}
        >
          <span className={styles.stepNumber}>{isDone ? <Check size={14} /> : step}</span>
          <span className={styles.stepLabel}>{label}</span>
        </li>
      );
    })}
  </ol>
);

const ParticipantsEditor = ({ adminToken, participants, onAdded, onBulkAdded, onEdit, onRemove }) => {
  const { addToast } = useToast();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [wishlist, setWishlist] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setIsSaving(true);
    try {
      const participant = await addParticipant(adminToken, { name: trimmed, wishlist: wishlist.trim() });
      onAdded(participant);
      setName('');
      setWishlist('');
      addToast(`${participant.name} entrou no grupo.`, 'success');
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível adicionar.'), 'error');
    } finally {
      setIsSaving(false);
      nameRef.current?.focus();
    }
  };

  const handleBulkAdd = async () => {
    const existing = new Set(participants.map((p) => p.name.toLocaleLowerCase('pt-BR')));
    const seen = new Set();
    const toAdd = [];
    const skipped = [];
    for (const raw of bulkText.split(/[\n,;]+/)) {
      const candidate = raw.trim();
      if (!candidate) continue;
      const key = candidate.toLocaleLowerCase('pt-BR');
      if (existing.has(key) || seen.has(key)) {
        skipped.push(candidate);
        continue;
      }
      seen.add(key);
      toAdd.push(candidate);
    }

    if (toAdd.length === 0) {
      addToast(skipped.length ? 'Esses nomes já estão na lista.' : 'Digite pelo menos um nome.', 'warning');
      return;
    }

    setIsSaving(true);
    const failed = [];
    for (const candidate of toAdd) {
      try {
        await addParticipant(adminToken, { name: candidate });
      } catch {
        failed.push(candidate);
      }
    }
    await onBulkAdded();
    setIsSaving(false);

    const added = toAdd.length - failed.length;
    if (added > 0) {
      addToast(`${plural(added, 'participante adicionado', 'participantes adicionados')}.`, 'success');
    }
    if (skipped.length > 0) {
      addToast(`Já estavam na lista: ${skipped.join(', ')}`, 'warning', 6000);
    }
    if (failed.length > 0) {
      addToast(`Não foi possível adicionar: ${failed.join(', ')}`, 'error', 6000);
      setBulkText(failed.join('\n'));
    } else {
      setBulkText('');
      setIsBulkOpen(false);
    }
  };

  return (
    <section className={styles.card} aria-labelledby="participantes-titulo">
      <div className={styles.cardHeader}>
        <h3 id="participantes-titulo" className={styles.cardTitle}>Quem vai participar?</h3>
        <Badge variant="primary">{plural(participants.length, 'pessoa', 'pessoas')}</Badge>
      </div>

      {isBulkOpen ? (
        <div className={styles.bulkBox}>
          <label htmlFor="nomes-em-lote" className={styles.fieldLabel}>
            Cole ou digite os nomes, um por linha (ou separados por vírgula)
          </label>
          <textarea
            id="nomes-em-lote"
            className={styles.textarea}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={'Ana\nBruno\nCarla'}
            autoFocus
          />
          <div className={styles.bulkActions}>
            <Button variant="outline" type="button" onClick={() => setIsBulkOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleBulkAdd} isLoading={isSaving}>
              Adicionar todos
            </Button>
          </div>
        </div>
      ) : (
        <>
          <form className={styles.addForm} onSubmit={handleAdd}>
            <Input
              ref={nameRef}
              label="Nome"
              placeholder="Ex: Maria"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              autoComplete="off"
              required
            />
            <Input
              label="Lista de desejos (opcional)"
              placeholder="Ou a pessoa preenche depois"
              value={wishlist}
              onChange={(e) => setWishlist(e.target.value)}
              maxLength={1000}
              autoComplete="off"
            />
            <Button type="submit" isLoading={isSaving} className={styles.addButton}>
              <span className={styles.btnContent}><Plus size={18} /> Adicionar</span>
            </Button>
          </form>
          <button type="button" className={styles.textLink} onClick={() => setIsBulkOpen(true)}>
            <ListPlus size={16} /> Adicionar vários nomes de uma vez
          </button>
        </>
      )}

      {participants.length === 0 ? (
        <p className={styles.emptyState}>
          Ninguém por aqui ainda. Adicione quem vai participar — inclusive você, se for entrar na brincadeira.
        </p>
      ) : (
        <ul className={styles.list}>
          {participants.map((p) => (
            <li key={p.id} className={styles.row}>
              <div className={styles.person}>
                <Avatar fallback={initials(p.name)} size="sm" />
                <div className={styles.personText}>
                  <span className={styles.personName}>{p.name}</span>
                  <span className={styles.personDetail}>{p.wishlist || 'Sem lista de desejos'}</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.editButton}
                onClick={() => onEdit(p)}
                aria-label={`Editar ${p.name}`}
                title={`Editar ${p.name}`}
              >
                <Pencil size={17} />
              </button>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemove(p)}
                aria-label={`Remover ${p.name}`}
                title={`Remover ${p.name}`}
              >
                <Trash2 size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const DrawCard = ({ count, isDrawing, onDraw }) => {
  const missing = Math.max(0, MIN_PARTICIPANTS - count);
  return (
    <section className={clsx(styles.card, styles.drawCard)} aria-labelledby="sorteio-titulo">
      <div className={clsx(styles.giftCircle, isDrawing && styles.shake)}>
        <Gift size={44} />
      </div>
      <h3 id="sorteio-titulo" className={styles.drawTitle}>
        {missing > 0 ? 'Sorteio' : 'Tudo pronto para sortear!'}
      </h3>
      <p className={styles.drawText}>
        {missing > 0
          ? `Adicione mais ${plural(missing, 'participante', 'participantes')} para liberar o sorteio.`
          : `Sorteio entre ${count} pessoas. Ninguém tira a si mesmo.`}
      </p>
      <Button size="lg" fullWidth onClick={onDraw} disabled={missing > 0} isLoading={isDrawing}>
        Sortear agora
      </Button>
      <p className={styles.secretNote}>
        <Lock size={12} /> O resultado não aparece aqui: cada pessoa vê só o dela, pelo próprio link.
      </p>
    </section>
  );
};

const SendLinks = ({ participants, onWhatsApp, onCopy, onEdit }) => {
  const total = participants.length;
  const viewed = participants.filter((p) => p.viewed_at).length;
  const sent = participants.filter((p) => p.link_sent_at || p.viewed_at).length;

  return (
    <section className={styles.card} aria-labelledby="links-titulo">
      <div className={styles.cardHeader}>
        <h3 id="links-titulo" className={styles.cardTitle}>Envie o link de cada pessoa</h3>
      </div>

      <div className={styles.progress}>
        <div className={styles.progressLabels}>
          <span><strong>{viewed} de {total}</strong> já viram quem tiraram</span>
          <span>{sent} de {total} links enviados</span>
        </div>
        <div
          className={styles.progressBar}
          role="progressbar"
          aria-label="Participantes que já viram o resultado"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={viewed}
        >
          <div className={styles.progressFill} style={{ width: `${total ? (viewed / total) * 100 : 0}%` }} />
        </div>
      </div>

      <p className={styles.tip}>
        <Lock size={16} className={styles.tipIcon} />
        Cada link é pessoal. A mensagem do WhatsApp já vai com o nome da pessoa, para você não trocar os links.
      </p>

      <ul className={styles.list}>
        {participants.map((p) => {
          const status = linkStatus(p);
          return (
            <li key={p.id} className={clsx(styles.row, styles.sendRow)}>
              <div className={styles.person}>
                <Avatar fallback={initials(p.name)} size="sm" />
                <div className={styles.personText}>
                  <span className={styles.personName}>{p.name}</span>
                  <Badge variant={status.variant} className={styles.statusBadge}>
                    {status.Icon && <status.Icon size={12} />}
                    {status.label}
                  </Badge>
                </div>
                <button
                  type="button"
                  className={clsx(styles.editButton, styles.pushRight)}
                  onClick={() => onEdit(p)}
                  aria-label={`Editar ${p.name}`}
                  title={`Editar ${p.name}`}
                >
                  <Pencil size={17} />
                </button>
              </div>
              <div className={styles.sendActions}>
                <Button
                  size="sm"
                  className={styles.whatsappButton}
                  onClick={() => onWhatsApp(p)}
                  aria-label={`Enviar o link de ${p.name} pelo WhatsApp`}
                >
                  <span className={styles.btnContent}><MessageCircle size={16} /> WhatsApp</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onCopy(p)}
                  aria-label={`Copiar o link de ${p.name}`}
                >
                  <span className={styles.btnContent}><Copy size={16} /> Copiar link</span>
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const EditParticipantModal = ({ participant, isDrawn, onClose, onSave }) => {
  const [name, setName] = useState(participant.name);
  const [wishlist, setWishlist] = useState(participant.wishlist || '');
  const [isSaving, setIsSaving] = useState(false);
  const wishlistId = useId();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const saved = await onSave({ name: name.trim(), wishlist: wishlist.trim() });
    if (!saved) setIsSaving(false);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Editar ${participant.name}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="form-editar-participante" isLoading={isSaving}>Salvar</Button>
        </>
      }
    >
      <form id="form-editar-participante" className={styles.modalForm} onSubmit={handleSubmit}>
        <Input
          label="Nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          autoComplete="off"
          autoFocus
          required
        />
        <div className={styles.field}>
          <label htmlFor={wishlistId} className={styles.fieldLabel}>Lista de desejos</label>
          <textarea
            id={wishlistId}
            className={clsx(styles.textarea, styles.textareaSmall)}
            value={wishlist}
            onChange={(e) => setWishlist(e.target.value)}
            maxLength={1000}
            placeholder="Ex: livro, chocolate..."
          />
          <span className={styles.fieldHint}>{participant.name} também pode editar a lista pelo próprio link.</span>
        </div>
        {isDrawn && (
          <p className={styles.modalNote}>
            <Lock size={14} className={styles.tipIcon} />
            O sorteio continua o mesmo: só o nome exibido muda, inclusive para quem tirou essa pessoa.
          </p>
        )}
      </form>
    </Modal>
  );
};

const EditGroupModal = ({ group, onClose, onSave, onDelete }) => {
  const [values, setValues] = useState(() => groupToValues(group));
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const saved = await onSave(valuesToPayload(values));
    if (!saved) setIsSaving(false);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Editar grupo"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="form-editar-grupo" isLoading={isSaving}>Salvar</Button>
        </>
      }
    >
      <form id="form-editar-grupo" onSubmit={handleSubmit}>
        <GroupFields values={values} onChange={setValues} />
        <div className={styles.dangerZone}>
          <div>
            <p className={styles.dangerTitle}>Excluir grupo</p>
            <p className={styles.dangerText}>Apaga o grupo, os participantes e o sorteio. Os links enviados param de funcionar.</p>
          </div>
          <Button type="button" variant="outline" size="sm" className={styles.dangerButton} onClick={onDelete}>
            <span className={styles.btnContent}><Trash2 size={15} /> Excluir</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export const Grupo = () => {
  const { adminToken } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [group, setGroup] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  useDocumentTitle(group?.name || 'Grupo');

  const loadGroup = useCallback(async ({ silent = false } = {}) => {
    try {
      setGroup(await getGroup(adminToken));
      setLoadFailed(false);
    } catch (err) {
      if (silent) return;
      if (err.response?.status === 404) {
        addToast('Grupo não encontrado.', 'error');
        navigate('/dashboard', { replace: true });
      } else {
        setLoadFailed(true);
      }
    }
  }, [adminToken, addToast, navigate]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  // Ao voltar para a aba (ex.: depois de mandar o link no WhatsApp), atualiza quem já viu o resultado.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') loadGroup({ silent: true });
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [loadGroup]);

  if (!group) {
    return (
      <div className={styles.page}>
        {loadFailed ? (
          <div className={styles.card}>
            <p>Não foi possível carregar o grupo. Verifique sua conexão.</p>
            <Button onClick={() => loadGroup()}>Tentar de novo</Button>
          </div>
        ) : (
          <p className={styles.loading}>Carregando grupo...</p>
        )}
      </div>
    );
  }

  const participants = group.participants;
  const count = participants.length;
  const currentStep = group.is_drawn ? 3 : count >= MIN_PARTICIPANTS ? 2 : 1;

  const updateParticipants = (updater) => setGroup((g) => ({ ...g, participants: updater(g.participants) }));

  const handleAdded = (participant) => updateParticipants((list) => [...list, participant].sort(byName));

  const askRemove = (participant) => setConfirm({
    title: `Remover ${participant.name}?`,
    message: `${participant.name} sairá do grupo "${group.name}".`,
    confirmText: 'Remover',
    isDanger: true,
    onConfirm: async () => {
      try {
        await removeParticipant(adminToken, participant.id);
        updateParticipants((list) => list.filter((p) => p.id !== participant.id));
        addToast(`${participant.name} foi removido(a).`, 'success');
      } catch (err) {
        addToast(errorMessage(err, 'Não foi possível remover.'), 'error');
      }
    },
  });

  const askDraw = () => setConfirm({
    title: 'Fazer o sorteio?',
    message: `O sorteio será feito entre as ${count} pessoas da lista. Depois disso a lista fica travada: para incluir ou remover alguém, será preciso desfazer o sorteio.`,
    confirmText: 'Sortear',
    onConfirm: async () => {
      setIsDrawing(true);
      try {
        // Pausa curta para a animação do presente aparecer.
        const [data] = await Promise.all([drawGroup(adminToken), new Promise((r) => setTimeout(r, 900))]);
        setGroup(data);
        addToast('Sorteio feito! Agora envie o link de cada pessoa.', 'success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        addToast(errorMessage(err, 'Não foi possível fazer o sorteio.'), 'error');
      } finally {
        setIsDrawing(false);
      }
    },
  });

  const askUndo = () => setConfirm({
    title: 'Desfazer o sorteio?',
    message: 'O resultado atual será apagado e a lista volta a ficar editável. Os links continuam os mesmos, mas quem já viu quem tirou precisará abrir o link de novo depois do novo sorteio.',
    confirmText: 'Desfazer sorteio',
    isDanger: true,
    onConfirm: async () => {
      setIsUndoing(true);
      try {
        setGroup(await undoDraw(adminToken));
        addToast('Sorteio desfeito. Ajuste a lista e sorteie de novo.', 'info');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (err) {
        addToast(errorMessage(err, 'Não foi possível desfazer o sorteio.'), 'error');
      } finally {
        setIsUndoing(false);
      }
    },
  });

  const saveGroup = async (payload) => {
    try {
      setGroup(await updateGroup(adminToken, payload));
      setIsEditingGroup(false);
      addToast('Grupo atualizado.', 'success');
      return true;
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível salvar o grupo.'), 'error');
      return false;
    }
  };

  const askDeleteGroup = () => {
    setIsEditingGroup(false);
    setConfirm({
      title: `Excluir "${group.name}"?`,
      message: `Isso apaga o grupo, ${plural(count, 'participante', 'participantes')} e o sorteio. Os links já enviados deixam de funcionar. Não dá para desfazer.`,
      confirmText: 'Excluir grupo',
      isDanger: true,
      onConfirm: async () => {
        try {
          await deleteGroup(adminToken);
          addToast(`Grupo "${group.name}" excluído.`, 'success');
          navigate('/dashboard', { replace: true });
        } catch (err) {
          addToast(errorMessage(err, 'Não foi possível excluir o grupo.'), 'error');
        }
      },
    });
  };

  const saveParticipant = async (payload) => {
    try {
      const updated = await updateParticipant(adminToken, editingParticipant.id, payload);
      updateParticipants((list) => list.map((p) => (p.id === updated.id ? updated : p)).sort(byName));
      setEditingParticipant(null);
      addToast(`${updated.name}: alterações salvas.`, 'success');
      return true;
    } catch (err) {
      addToast(errorMessage(err, 'Não foi possível salvar.'), 'error');
      return false;
    }
  };

  const markSent = (participant) => {
    if (participant.link_sent_at) return;
    const now = new Date().toISOString();
    updateParticipants((list) => list.map((p) => (p.id === participant.id ? { ...p, link_sent_at: now } : p)));
    // O status é apenas informativo: se a chamada falhar, o próximo carregamento corrige.
    markLinkSent(adminToken, participant.id).catch(() => {});
  };

  const handleWhatsApp = (participant) => {
    const text = encodeURIComponent(buildWhatsAppMessage(participant, group));
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener');
    markSent(participant);
  };

  const handleCopy = async (participant) => {
    const url = revealUrl(participant.token);
    try {
      await navigator.clipboard.writeText(url);
      addToast(`Link de ${participant.name} copiado!`, 'success');
    } catch {
      window.prompt(`Copie o link de ${participant.name}:`, url);
    }
    markSent(participant);
  };

  const handleConfirm = () => {
    const action = confirm.onConfirm;
    setConfirm(null);
    action();
  };

  return (
    <div className={styles.page}>
      <Link to="/dashboard" className={styles.backLink}>
        <ArrowLeft size={16} /> Meus grupos
      </Link>

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.groupName}>{group.name}</h2>
          <Button variant="outline" size="sm" onClick={() => setIsEditingGroup(true)} className={styles.editGroupButton}>
            <span className={styles.btnContent}><Pencil size={15} /> Editar grupo</span>
          </Button>
        </div>
        {group.description && <p className={styles.groupDescription}>{group.description}</p>}
        <div className={styles.chips}>
          <span className={styles.chip}><Users size={14} /> {plural(count, 'participante', 'participantes')}</span>
          {group.event_date && (
            <span className={styles.chip}><CalendarDays size={14} /> {formatEventDate(group.event_date, group.event_time)}</span>
          )}
          {group.location && (
            <a className={clsx(styles.chip, styles.chipLink)} href={mapsUrl(group.location)} target="_blank" rel="noopener noreferrer">
              <MapPin size={14} /> {group.location}
            </a>
          )}
          {!group.event_date && !group.location && (
            <button type="button" className={clsx(styles.chip, styles.chipAction)} onClick={() => setIsEditingGroup(true)}>
              <Plus size={14} /> Adicionar data e local da festa
            </button>
          )}
          {group.budget && <span className={styles.chip}><Wallet size={14} /> {formatBudget(group.budget)}</span>}
          {group.is_drawn && <span className={clsx(styles.chip, styles.chipSuccess)}><Check size={14} /> Sorteado</span>}
        </div>
      </header>

      <Stepper current={currentStep} />

      {group.is_drawn ? (
        <div className={styles.stack}>
          <SendLinks participants={participants} onWhatsApp={handleWhatsApp} onCopy={handleCopy} onEdit={setEditingParticipant} />

          <section className={clsx(styles.card, styles.undoCard)}>
            <div>
              <h3 className={styles.cardTitle}>Precisa mudar alguém?</h3>
              <p className={styles.cardHint}>
                Desfaça o sorteio para editar a lista e sortear de novo. Os links continuam os mesmos.
              </p>
            </div>
            <Button variant="outline" onClick={askUndo} isLoading={isUndoing} className={styles.undoButton}>
              <span className={styles.btnContent}><RotateCcw size={16} /> Desfazer sorteio</span>
            </Button>
          </section>
        </div>
      ) : (
        <div className={styles.columns}>
          <ParticipantsEditor
            adminToken={adminToken}
            participants={participants}
            onAdded={handleAdded}
            onBulkAdded={() => loadGroup({ silent: true })}
            onEdit={setEditingParticipant}
            onRemove={askRemove}
          />
          <aside className={styles.aside}>
            <DrawCard count={count} isDrawing={isDrawing} onDraw={askDraw} />
          </aside>
        </div>
      )}

      {isEditingGroup && (
        <EditGroupModal
          group={group}
          onClose={() => setIsEditingGroup(false)}
          onSave={saveGroup}
          onDelete={askDeleteGroup}
        />
      )}

      {editingParticipant && (
        <EditParticipantModal
          key={editingParticipant.id}
          participant={editingParticipant}
          isDrawn={group.is_drawn}
          onClose={() => setEditingParticipant(null)}
          onSave={saveParticipant}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmText={confirm?.confirmText}
        isDanger={confirm?.isDanger}
      />
    </div>
  );
};
