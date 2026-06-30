import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Gift, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { drawGroup, getGroup } from '../../api';
import { useToast } from '../../context/ToastContext';
import styles from './Sorteio.module.css';

export const Sorteio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const adminToken = location.state?.adminToken;

  const [group, setGroup] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!adminToken) {
      navigate('/dashboard');
      return;
    }
    getGroup(adminToken).then(setGroup).catch(() => {
      navigate('/dashboard');
    });
  }, [adminToken, navigate]);

  const handleSorteio = async () => {
    setIsAnimating(true);
    try {
      await drawGroup(adminToken);
      setIsDone(true);
      addToast('Sorteio realizado com sucesso!', 'success');
    } catch (err) {
      addToast(err.response?.data?.detail || 'Erro ao realizar o sorteio', 'error');
    } finally {
      setIsAnimating(false);
    }
  };

  if (!group) return <div style={{ padding: '2rem' }}>Carregando...</div>;

  if (isDone || group.is_drawn) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.successCard}`}>
          <div className={styles.successIconWrapper}>
            <ShieldCheck size={64} className={styles.successIcon} />
          </div>
          <h2 className={styles.title}>Sorteio Realizado com Sucesso!</h2>
          <p className={styles.description}>
            O sorteio do grupo <strong>{group.name}</strong> já foi concluído.
            Você pode copiar o link de revelação de cada participante na aba de Participantes para enviar para eles!
          </p>
          <div className={styles.actions}>
            <Button size="lg" onClick={() => navigate('/participantes', { state: { adminToken } })}>
              Ver Links dos Participantes
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={`${styles.giftWrapper} ${isAnimating ? styles.shake : ''}`}>
          <Gift size={80} className={styles.giftIcon} />
        </div>
        
        <h2 className={styles.title}>Tudo pronto para o sorteio!</h2>
        <p style={{ textAlign: 'center', marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
          Grupo: <strong>{group.name}</strong>
        </p>
        
        <div className={styles.rulesList}>
          <div className={styles.ruleItem}>
            <UserCheck size={20} className={styles.ruleIcon} />
            <span><strong>{group.participants.length} participantes</strong> cadastrados</span>
          </div>
          <div className={styles.ruleItem}>
            <ShieldCheck size={20} className={styles.ruleIcon} />
            <span>Sorteio 100% automático e justo</span>
          </div>
          <div className={styles.ruleItem}>
            <Lock size={20} className={styles.ruleIcon} />
            <span>Resultado secreto e seguro</span>
          </div>
        </div>

        <Button 
          size="lg" 
          fullWidth 
          onClick={handleSorteio} 
          isLoading={isAnimating}
          className={styles.mainButton}
        >
          {isAnimating ? 'Sorteando...' : 'Iniciar Sorteio'}
        </Button>

        <p className={styles.footerNote}>
          <Lock size={14} />
          O resultado será revelado apenas para cada participante individualmente através do link de revelação.
        </p>
      </div>
    </div>
  );
};
