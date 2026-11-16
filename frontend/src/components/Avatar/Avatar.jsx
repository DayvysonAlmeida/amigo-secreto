import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Avatar.module.css';

export const Avatar = ({ src, alt, fallback, size = 'md', className }) => {
  // Se a foto não carregar (ex.: arquivo apagado num redeploy), mostra as iniciais.
  const [failedSrc, setFailedSrc] = useState(null);
  const showImage = src && failedSrc !== src;

  return (
    <div className={clsx(styles.avatar, styles[size], className)}>
      {showImage ? (
        <img src={src} alt={alt || 'Avatar'} className={styles.image} onError={() => setFailedSrc(src)} />
      ) : (
        <span className={styles.fallback}>{fallback}</span>
      )}
    </div>
  );
};
