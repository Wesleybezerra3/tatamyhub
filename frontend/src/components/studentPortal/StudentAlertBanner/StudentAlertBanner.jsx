import React from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import styles from './StudentAlertBanner.module.css';

export function StudentAlertBanner({ alert, onActionClick }) {
  if (!alert) return null;

  const isOverdue = alert.tipo === 'atrasada';
  const isAttention = alert.tipo === 'atencao';
  const isRegular = alert.tipo === 'regular';

  const bannerClass = isOverdue
    ? styles.bannerAtrasada
    : isAttention
    ? styles.bannerAtencao
    : styles.bannerRegular;

  const iconClass = isOverdue
    ? styles.iconAtrasada
    : isAttention
    ? styles.iconAtencao
    : styles.iconRegular;

  return (
    <div className={`${styles.banner} ${bannerClass}`}>
      <div className={styles.contentWrapper}>
        <div className={`${styles.iconCircle} ${iconClass}`}>
          {isOverdue && <AlertTriangle size={22} />}
          {isAttention && <Clock size={22} />}
          {isRegular && <CheckCircle2 size={22} />}
        </div>

        <div className={styles.textGroup}>
          <h3 className={styles.title}>{alert.titulo}</h3>
          <p className={styles.message}>{alert.mensagem}</p>
        </div>
      </div>

      {(isOverdue || isAttention) && onActionClick && (
        <button
          type="button"
          onClick={onActionClick}
          className={styles.actionBtn}
        >
          Ver Fatura & Pagar
        </button>
      )}
    </div>
  );
}
