import React from 'react';
import { Copy, MessageCircle, Gift } from 'lucide-react';
import { Button } from '../../components/Button/Button';
import { Avatar } from '../../components/Avatar/Avatar';
import styles from './Resultado.module.css';

export const Resultado = () => {
  const result = {
    name: 'Ana Souza',
    initials: 'AS',
    photo: null, // would be an image URL if available
    message: 'Que sorte! Prepara o presente!'
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`Meu amigo secreto é: ${result.name}`);
    alert('Copiado para a área de transferência!'); // We'll replace with Toast later
  };

  return (
    <div className={styles.container}>
      <div className={styles.confettiOverlay}></div>
      
      <div className={styles.card}>
        <div className={styles.header}>
          <Gift size={32} className={styles.headerIcon} />
          <h2>Seu Amigo Secreto</h2>
        </div>
        
        <p className={styles.revealText}>Você tirou:</p>
        
        <div className={styles.resultBox}>
          <div className={styles.avatarWrapper}>
            <Avatar src={result.photo} fallback={result.initials} size="lg" className={styles.avatar} />
          </div>
          <h1 className={styles.resultName}>{result.name}</h1>
          <p className={styles.resultMessage}>{result.message}</p>
        </div>

        <div className={styles.actions}>
          <Button fullWidth size="lg" className={styles.whatsappButton}>
            <MessageCircle size={20} style={{ marginRight: '8px' }} />
            Mandar mensagem
          </Button>
          <Button variant="outline" fullWidth size="lg" onClick={handleCopy}>
            <Copy size={20} style={{ marginRight: '8px' }} />
            Copiar resultado
          </Button>
        </div>
      </div>
    </div>
  );
};
