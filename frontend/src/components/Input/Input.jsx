import React, { forwardRef } from 'react';
import clsx from 'clsx';
import styles from './Input.module.css';

export const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className,
  fullWidth = true,
  ...props
}, ref) => {
  return (
    <div className={clsx(styles.wrapper, fullWidth && styles.fullWidth, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.inputContainer}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={clsx(
            styles.input,
            Icon && styles.hasIcon,
            error && styles.hasError
          )}
          {...props}
        />
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
