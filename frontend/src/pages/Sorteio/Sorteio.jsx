import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import styles from './Sorteio.module.css';

export const Sorteio = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSorteio = () => {
    setIsAnimating(true);
    // Simulate animation time
    setTimeout(() => {
      setIsAnimating(false);
      setIsDone(true);
    }, 3000);
  };

  if (isDone) {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.successCard}`}>
          <div className={styles.successIconWrapper}>
            <ShieldCheck size={64} className={styles.successIcon} />
          </div>
          <h2 className={styles.title}>Sorteio Realizado com Sucesso!</h2>
          <p className={styles.description}>
            Todos os participantes receberão um e-mail com o link seguro para visualizar o resultado. Ninguém além de cada participante sabe quem ele tirou.
          </p>
          <div className={styles.actions}>
            <Button size="lg" onClick={() => navigate('/resultado')}>
              Ver Meu Resultado
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
        
        <div className={styles.rulesList}>
          <div className={styles.ruleItem}>
            <UserCheck size={20} className={styles.ruleIcon} />
            <span><strong>8 participantes</strong> confirmados</span>
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
          O resultado será revelado apenas para cada participante individualmente.
        </p>
      </div>
    </div>
  );
};
