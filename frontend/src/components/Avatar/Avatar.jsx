import React from 'react';
import clsx from 'clsx';
import styles from './Avatar.module.css';

export const Avatar = ({ src, alt, fallback, size = 'md', className }) => {
  return (
    <div className={clsx(styles.avatar, styles[size], className)}>
      {src ? (
        <img src={src} alt={alt || 'Avatar'} className={styles.image} />
      ) : (
        <span className={styles.fallback}>{fallback}</span>
      )}
    </div>
  );
};
