import React from 'react';
import styles from './MetricCard.module.css';

export function MetricCard({ title, value, subtitle, icon, variant = 'default', badgeText }) {
  return (
    <div className={`${styles.card} ${styles[variant] || styles.default}`}>
      <div className={styles.topRow}>
        <span className={styles.title}>{title}</span>
        {icon && <div className={styles.iconBadge}>{icon}</div>}
      </div>

      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {badgeText && <span className={styles.badge}>{badgeText}</span>}
      </div>

      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
