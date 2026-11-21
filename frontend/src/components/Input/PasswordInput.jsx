import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input } from './Input';
import styles from './Input.module.css';

// Campo de senha com o botão de mostrar/ocultar dentro do campo.
export const PasswordInput = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      ref={ref}
      icon={Lock}
      {...props}
      type={visible ? 'text' : 'password'}
      endAdornment={
        <button
          type="button"
          className={styles.adornmentButton}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
});

PasswordInput.displayName = 'PasswordInput';
