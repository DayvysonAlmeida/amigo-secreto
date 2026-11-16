import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './Modal.module.css';

export const Modal = ({ isOpen, onClose, title, children, footer }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h3 id="modal-title" className={styles.title}>{title}</h3>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Fechar">
            <X size={20} />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>{cancelText}</Button>
          <Button variant={isDanger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmText}</Button>
        </>
      }
    >
      <p className={styles.confirmMessage}>{message}</p>
    </Modal>
  );
};
