import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import styles from './Alert.module.css';

export function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const icons = {
    error: <AlertCircle className={styles.icon} size={20} />,
    success: <CheckCircle className={styles.icon} size={20} />,
    info: <Info className={styles.icon} size={20} />
  };

  return (
    <div className={`${styles.alert} ${styles[type] || styles.info}`} role="alert">
      <div className={styles.content}>
        {icons[type] || icons.info}
        <span className={styles.message}>{message}</span>
      </div>
      {onClose && (
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fechar alerta">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
