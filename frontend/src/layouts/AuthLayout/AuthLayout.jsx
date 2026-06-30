import React from 'react';
import { Outlet } from 'react-router-dom';
import { Gift } from 'lucide-react';
import styles from './AuthLayout.module.css';

export const AuthLayout = () => {
  return (
    <div className={styles.container}>
      {/* Lado Esquerdo - Ilustração/Logo */}
      <div className={styles.leftPanel}>
        <div className={styles.brand}>
          <div className={styles.logoWrapper}>
            <Gift className={styles.logoIcon} size={32} />
          </div>
          <h1 className={styles.brandName}>
            Amigo<br />
            <span className={styles.brandHighlight}>Secreto</span>
          </h1>
        </div>
        
        <div className={styles.heroText}>
          <h2>Conecte-se para participar dessa experiência</h2>
          <p>Organize seu amigo secreto de forma rápida e divertida.</p>
        </div>
        
        <div className={styles.decorations}>
           {/* Aqui poderiam entrar ilustrações de presentes flutuantes. */}
           <div className={styles.gift1}><Gift size={48} /></div>
           <div className={styles.gift2}><Gift size={64} /></div>
        </div>
      </div>

      {/* Lado Direito - Conteúdo (Formulário) */}
      <div className={styles.rightPanel}>
        <Outlet />
      </div>
    </div>
  );
};
