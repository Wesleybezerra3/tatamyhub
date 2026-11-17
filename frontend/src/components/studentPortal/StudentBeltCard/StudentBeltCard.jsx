import React, { useState } from 'react';
import { Award, Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';
import { BeltBadge } from '../../students/BeltBadge/BeltBadge';
import styles from './StudentBeltCard.module.css';

export function StudentBeltCard({ currentGraduation, history = [] }) {
  const [showHistory, setShowHistory] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    const cleanDate = (dateStr instanceof Date ? dateStr.toISOString() : String(dateStr)).split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const faixa = currentGraduation?.faixa_atual || currentGraduation?.faixa || 'Branca';
  const graus = Number(currentGraduation?.graus_atual ?? currentGraduation?.graus ?? 0);
  const modalidadeNome = currentGraduation?.modalidade_nome || 'Artes Marciais';
  const dataGraduacao = currentGraduation?.data_graduacao || currentGraduation?.data_inicio;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Award size={20} color="#3B82F6" />
          <h2 className={styles.title}>Graduação Atual</h2>
        </div>
        <span className={styles.modalityBadge}>{modalidadeNome}</span>
      </div>

      <div className={styles.beltDisplaySection}>
        <BeltBadge faixa={faixa} graus={graus} size="lg" />

        <div className={styles.beltMeta}>
          <div className={styles.metaItem}>
            <Award size={15} />
            <span>{graus > 0 ? `${graus}º Grau` : 'Sem graus'}</span>
          </div>
          {dataGraduacao && (
            <div className={styles.metaItem}>
              <Calendar size={15} />
              <span>Desde {formatDate(dataGraduacao)}</span>
            </div>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <>
          <button
            type="button"
            className={styles.toggleHistoryBtn}
            onClick={() => setShowHistory(prev => !prev)}
          >
            <History size={15} />
            <span>{showHistory ? 'Ocultar Linha do Tempo' : `Ver Trajetória (${history.length} graduações)`}</span>
            {showHistory ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          {showHistory && (
            <div className={styles.historyTimeline}>
              {history.map((item, idx) => (
                <div key={item.id || idx} className={styles.timelineItem}>
                  <div className={styles.timelineNode} />
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineHeading}>
                      <span className={styles.timelineFaixa}>
                        Faixa {item.faixa} {item.graus > 0 ? `(${item.graus}º Grau)` : ''}
                      </span>
                      <span className={styles.timelineDate}>{formatDate(item.data_graduacao)}</span>
                    </div>
                    {item.observacao && (
                      <span className={styles.timelineObs}>{item.observacao}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
