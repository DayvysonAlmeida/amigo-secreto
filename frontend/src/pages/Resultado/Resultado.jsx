import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Gift, Lock } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import { revealParticipant } from '../../api';
import styles from './Resultado.module.css';

export const Resultado = () => {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    revealParticipant(token)
      .then(setResult)
      .catch(err => {
        setError(err.response?.data?.detail || err.message || 'Erro ao revelar resultado');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Carregando seu resultado...</div>;

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h2 style={{ color: '#ef4444', textAlign: 'center' }}>Oops!</h2>
          <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-main)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const initials = result.assigned_name.substring(0, 2).toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.confettiOverlay}></div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <Gift size={32} className={styles.headerIcon} />
          <h2>Seu Amigo Secreto</h2>
        </div>
        
        <p className={styles.revealText}>
          Olá <strong>{result.participant_name}</strong>! No grupo <strong>{result.group_name}</strong>, você tirou:
        </p>
        
        <div className={styles.resultBox}>
          <div className={styles.avatarWrapper}>
            <Avatar fallback={initials} size="lg" className={styles.avatar} />
          </div>
          <h1 className={styles.resultName}>{result.assigned_name}</h1>
          
          {result.assigned_wishlist && (
            <div style={{ marginTop: '1rem', backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', textAlign: 'left' }}>
              <strong>Lista de desejos:</strong>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-main)', whiteSpace: 'pre-wrap' }}>
                {result.assigned_wishlist}
              </p>
            </div>
          )}
          
          {result.budget && (
            <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Valor sugerido: R$ {result.budget}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
            <Lock size={12} />
            Mantenha segredo! Não compartilhe esta tela.
          </p>
        </div>
      </div>
    </div>
  );
};
