import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { AlertCircle, Eye, Gift, PartyPopper, Plus, RefreshCw, Send, Shuffle, UserPlus, Users } from 'lucide-react';
import { Card, CardContent } from '../../components/Card/Card';
import { Button } from '../../components/Button/Button';
import { Badge } from '../../components/Badge/Badge';
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

export const Dashboard = () => {
  useDocumentTitle('Dashboard');
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

  const totalParticipantes = grupos.reduce((acc, g) => acc + g.participants.length, 0);
  const sorteiosRealizados = grupos.filter(g => g.is_drawn).length;

  const stats = [
    { label: 'Grupos Criados', value: grupos.length.toString(), icon: Users, color: '#3b82f6', bgColor: '#dbeafe' },
    { label: 'Sorteios Realizados', value: sorteiosRealizados.toString(), icon: Gift, color: '#ec4899', bgColor: '#fce7f3' },
    { label: 'Participantes', value: totalParticipantes.toString(), icon: Users, color: '#8b5cf6', bgColor: '#ede9fe' },
  ];

  if (status === 'loading') {
    return <div style={{ padding: '2rem' }}>Carregando seus grupos...</div>;
  }

  if (status === 'failed') {
    return (
      <Card>
        <CardContent className={styles.errorState}>
          <AlertCircle size={32} className={styles.errorIcon} />
          <p className={styles.errorTitle}>Não foi possível carregar os seus grupos</p>
          <p className={styles.errorText}>Verifique a sua internet e tente de novo.</p>
          <Button onClick={loadGroups}>
            <RefreshCw size={16} style={{ marginRight: '8px' }} />
            Tentar de novo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className={styles.statCard}>
              <CardContent className={styles.statContent}>
                <div
                  className={styles.statIconWrapper}
                  style={{ backgroundColor: stat.bgColor, color: stat.color }}
                >
                  <Icon size={24} />
                </div>
                <div className={styles.statInfo}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <h3 className={styles.statValue}>{stat.value}</h3>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Meus Grupos</h2>
        <Button onClick={() => navigate('/grupos/novo')}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Criar grupo
        </Button>
      </div>

      <div className={styles.groupsGrid}>
        {grupos.map((grupo) => {
          const iconColor = grupo.is_drawn ? '#8b5cf6' : '#10b981';
          const status = grupo.is_drawn ? 'Sorteado' : 'Aguardando sorteio';
          const statusVariant = grupo.is_drawn ? 'success' : 'warning';
          const dateStr = new Date(grupo.created_at).toLocaleDateString('pt-BR');
          const total = grupo.participants.length;
          const groupUrl = `/grupos/${grupo.admin_token}`;
          const step = groupNextStep(grupo);

          return (
            <Card key={grupo.id} className={styles.groupCard}>
              <CardContent className={styles.groupContent}>
                <div className={styles.groupHeader}>
                  <Badge variant={statusVariant}>{status}</Badge>
                </div>

                <div className={styles.groupMainInfo}>
                  <div className={styles.groupIconWrapper} style={{ color: iconColor }}>
                    <Users size={48} strokeWidth={1.5} />
                  </div>
                  <h3 className={styles.groupName}>{grupo.name}</h3>
                  <p className={styles.groupParticipants}>{total} {total === 1 ? 'participante' : 'participantes'}</p>
                  <p className={styles.groupDate}>
                    {grupo.event_date
                      ? `Festa: ${formatEventDate(grupo.event_date, grupo.event_time, { short: true })}`
                      : `Criado em ${dateStr}`}
                  </p>
                </div>

                <NextStep step={step} />

                <div className={styles.groupFooter}>
                  <Button
                    variant={step.primary ? 'primary' : 'outline'}
                    fullWidth
                    onClick={() => navigate(groupUrl)}
                    aria-label={`${step.action}: ${grupo.name}`}
                  >
                    {step.action}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <button className={styles.createGroupCard} onClick={() => navigate('/grupos/novo')}>
          <div className={styles.createGroupContent}>
            <Plus size={32} className={styles.createGroupIcon} />
            <span>Criar novo grupo</span>
          </div>
        </button>
      </div>
    </div>
  );
};
