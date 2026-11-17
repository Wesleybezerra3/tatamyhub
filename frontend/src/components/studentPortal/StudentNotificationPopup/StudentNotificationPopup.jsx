import React, { useState } from 'react';
import { AlertTriangle, Clock, X, Copy, Check } from 'lucide-react';
import styles from './StudentNotificationPopup.module.css';

export function StudentNotificationPopup({ alert, chavePix, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!alert || !alert.deve_exibir_popup) return null;

  const isOverdue = alert.tipo === 'atrasada';

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const cleanDate = (dateStr instanceof Date ? dateStr.toISOString() : String(dateStr)).split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleCopy = () => {
    if (!chavePix) return;
    navigator.clipboard.writeText(chavePix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDismiss = () => {
    sessionStorage.setItem('tatamyhub_aluno_popup_dismissed', 'true');
    if (onClose) onClose();
  };

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modalCard}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={isOverdue ? styles.iconBoxAtrasada : styles.iconBoxAtencao}>
              {isOverdue ? <AlertTriangle size={22} /> : <Clock size={22} />}
            </div>
            <h3 className={styles.title}>{alert.titulo}</h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleDismiss}
            aria-label="Fechar aviso"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <p className={styles.message}>{alert.mensagem}</p>

          <div className={styles.invoiceHighlight}>
            <div className={styles.highlightLeft}>
              <span className={styles.highlightLabel}>
                {alert.competencia ? `Fatura ${alert.competencia}` : 'Valor Pendente'}
              </span>
              <span className={styles.highlightValue}>{formatCurrency(alert.valor)}</span>
            </div>
            {alert.data_vencimento && (
              <span className={styles.highlightDate}>
                Vencimento: {formatDate(alert.data_vencimento)}
              </span>
            )}
          </div>

          {chavePix && (
            <div className={styles.pixSection}>
              <span className={styles.pixTitle}>Chave PIX para pagamento:</span>
              <div className={styles.pixRow}>
                <span className={styles.pixKey} title={chavePix}>
                  {chavePix}
                </span>
                <button
                  type="button"
                  className={`${styles.copyBtn} ${copied ? styles.copySuccess : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.dismissBtn}
            onClick={handleDismiss}
          >
            Entendi, ir para o Hub
          </button>
        </div>
      </div>
    </div>
  );
}
