import styles from './PageLoader.module.css';

// Indicador enquanto uma tela carrega. Só aparece se demorar (evita piscar em conexões rápidas).
export const PageLoader = ({ fullScreen = true }) => (
  <div className={fullScreen ? styles.fullScreen : styles.inline} role="status" aria-label="Carregando">
    <span className={styles.spinner} />
  </div>
);
