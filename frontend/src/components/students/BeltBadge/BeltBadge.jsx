import React from 'react';
import styles from './BeltBadge.module.css';

const BELT_CONFIGS = {
  branca: { bg: '#E5E7EB', text: '#111827', border: '#D1D5DB', label: 'Branca' },
  cinza: { bg: '#9CA3AF', text: '#FFFFFF', border: '#6B7280', label: 'Cinza' },
  amarela: { bg: '#FBBF24', text: '#78350F', border: '#D97706', label: 'Amarela' },
  laranja: { bg: '#FB923C', text: '#FFFFFF', border: '#EA580C', label: 'Laranja' },
  verde: { bg: '#10B981', text: '#FFFFFF', border: '#059669', label: 'Verde' },
  azul: { bg: '#2563EB', text: '#FFFFFF', border: '#1D4ED8', label: 'Azul' },
  roxa: { bg: '#7C3AED', text: '#FFFFFF', border: '#6D28D9', label: 'Roxa' },
  marrom: { bg: '#78350F', text: '#FEF3C7', border: '#451A03', label: 'Marrom' },
  preta: { bg: '#0F172A', text: '#F87171', border: '#EF4444', label: 'Preta' },
  coral: { bg: '#DC2626', text: '#FFFFFF', border: '#B91C1C', label: 'Coral' },
  vermelha: { bg: '#B91C1C', text: '#FFFFFF', border: '#991B1B', label: 'Vermelha' }
};

export function BeltBadge({ faixa = 'Branca', graus = 0, size = 'md' }) {
  const normalizedKey = (faixa || 'branca').toLowerCase().trim();
  const config = BELT_CONFIGS[normalizedKey] || {
    bg: '#374151',
    text: '#F3F4F6',
    border: '#4B5563',
    label: faixa || 'Branca'
  };

  const numGraus = Math.min(Math.max(Number(graus) || 0, 0), 4);

  return (
    <div 
      className={`${styles.badge} ${styles[size]}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border
      }}
      title={`Faixa ${config.label}${numGraus > 0 ? ` - ${numGraus}º Grau` : ''}`}
    >
      <span className={styles.beltName}>{config.label}</span>

      {numGraus > 0 && (
        <div className={styles.stripesWrapper} aria-label={`${numGraus} graus`}>
          {Array.from({ length: numGraus }).map((_, i) => (
            <span key={i} className={styles.stripe} />
          ))}
        </div>
      )}
    </div>
  );
}
