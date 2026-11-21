import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  AlertCircle, CalendarDays, Eye, Gift, MessageCircle, PartyPopper, Plus, RefreshCw, Send, Shuffle, UserPlus, Users,
} from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
import { PageLoader } from '../../components/PageLoader/PageLoader';
import { getGroups } from '../../api';
import { formatEventDate } from '../../utils/format';
import { groupNextStep } from '../../utils/group';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from './Dashboard.module.css';

const STEP_ICONS = {
  participants: UserPlus,
  draw: Shuffle,
  send: Send,
  wait: Eye,
  done: PartyPopper,
};

const HOW_IT_WORKS = [
  { Icon: Users, text: 'Monte o grupo e adicione quem vai participar' },
  { Icon: Shuffle, text: 'Sorteie com um toque (ninguém tira a si mesmo)' },
  { Icon: MessageCircle, text: 'Envie o link secreto de cada pessoa pelo WhatsApp' },
];

const NextStep = ({ step }) => {
  const Icon = STEP_ICONS[step.key];
  const { progress } = step;
  return (
    <div className={clsx(styles.nextStep, step.key === 'done' && styles.nextStepDone)}>
      <p className={styles.nextStepLabel}>{step.key === 'done' ? 'Situação' : 'Próximo passo'}</p>
      <p className={styles.nextStepTitle}><Icon size={16} /> {step.title}</p>
      {step.text && <p className={styles.nextStepText}>{step.text}</p>}
      {progress && (
        <>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-label={progress.label}
            aria-valuemin={0}
            aria-valuemax={progress.total}
            aria-valuenow={progress.value}
          >
            <div className={styles.progressFill} style={{ width: `${(progress.value / progress.total) * 100}%` }} />
          </div>
          <p className={styles.nextStepText}>{progress.label}</p>
        </>
      )}
    </div>
  );
};

const GroupCard = ({ group, onOpen }) => {
  const total = group.participants.length;
  const step = groupNextStep(group);
  const when = group.event_date ? formatEventDate(group.event_date, group.event_time, { short: true }) : null;

  return (
    <Card className={styles.groupCard}>
      <CardContent className={styles.groupContent}>
        <div className={styles.groupTop}>
          <h3 className={styles.groupName}>{group.name}</h3>
          <Badge variant={group.is_drawn ? 'success' : 'warning'} className={styles.status}>
            {group.is_drawn ? 'Sorteado' : 'A sortear'}
          </Badge>
        </div>
        <p className={styles.groupMeta}>
          <span><Users size={14} /> {total} {total === 1 ? 'participante' : 'participantes'}</span>
          {when && <span><CalendarDays size={14} /> {when}</span>}
        </p>

        <NextStep step={step} />

        <Button
          variant={step.primary ? 'primary' : 'outline'}
          fullWidth
          onClick={onOpen}
          aria-label={`${step.action}: ${group.name}`}
        >
          {step.action}
        </Button>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ onCreate }) => (
  <Card className={styles.empty}>
    <CardContent className={styles.emptyContent}>
      <span className={styles.emptyIcon}><Gift size={32} /></span>
      <h2 className={styles.emptyTitle}>Crie o seu primeiro amigo secreto</h2>
      <ol className={styles.howItWorks}>
        {HOW_IT_WORKS.map(({ Icon, text }) => (
          <li key={text}><span className={styles.howIcon}><Icon size={16} /></span>{text}</li>
        ))}
      </ol>
      <Button size="lg" onClick={onCreate}>
        <span className={styles.btnContent}><Plus size={18} /> Criar grupo</span>
      </Button>
    </CardContent>
  </Card>
);

export const Dashboard = () => {
  useDocumentTitle('Meus grupos');
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | failed

  const loadGroups = useCallback(() => {
    setStatus('loading');
    getGroups()
      .then((data) => {
        setGrupos(data);
        setStatus('ready');
      })
      .catch(() => setStatus('failed'));
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const createGroup = () => navigate('/grupos/novo');

  if (status === 'loading') return <PageLoader fullScreen={false} />;

  if (status === 'failed') {
    return (
      <Card>
        <CardContent className={styles.errorState}>
          <AlertCircle size={32} className={styles.errorIcon} />
          <p className={styles.errorTitle}>Não foi possível carregar os seus grupos</p>
          <p className={styles.errorText}>Verifique a sua internet e tente de novo.</p>
          <Button onClick={loadGroups}>
            <span className={styles.btnContent}><RefreshCw size={16} /> Tentar de novo</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (grupos.length === 0) return <EmptyState onCreate={createGroup} />;

  return (
    <div className={styles.dashboard}>
      <div className={styles.toolbar}>
        <p className={styles.count}>
          {grupos.length} {grupos.length === 1 ? 'grupo' : 'grupos'}
        </p>
        <Button onClick={createGroup}>
          <span className={styles.btnContent}><Plus size={18} /> Criar grupo</span>
        </Button>
      </div>

      <div className={styles.groupsGrid}>
        {grupos.map((grupo) => (
          <GroupCard key={grupo.id} group={grupo} onOpen={() => navigate(`/grupos/${grupo.admin_token}`)} />
        ))}

        <button type="button" className={styles.createGroupCard} onClick={createGroup}>
          <Plus size={24} />
          <span>Criar outro grupo</span>
        </button>
      </div>
    </div>
  );
};
