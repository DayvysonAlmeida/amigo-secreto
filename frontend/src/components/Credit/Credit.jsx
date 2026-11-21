import clsx from 'clsx';
import styles from './Credit.module.css';

// Assinatura discreta no rodapé das telas. `onDark` é para fundos verdes (tela de entrar/cadastrar).
export const Credit = ({ onDark = false, className }) => (
  <p className={clsx(styles.credit, onDark && styles.onDark, className)}>
    Desenvolvido por <span className={styles.name}>DayFer</span>
  </p>
);
