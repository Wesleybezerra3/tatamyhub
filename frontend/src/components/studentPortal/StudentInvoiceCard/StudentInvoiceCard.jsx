import React, { useState } from 'react';
import { Copy, Check, MessageSquare, Receipt, AlertCircle } from 'lucide-react';
import styles from './StudentInvoiceCard.module.css';

export function StudentInvoiceCard({ invoice, chavePixDefault, whatsappAcademia, beneficiarioPix }) {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    const cleanDate = (dateStr instanceof Date ? dateStr.toISOString() : String(dateStr)).split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const pixKey = invoice.chave_pix || chavePixDefault || invoice.chave_pix_whatsapp || invoice.chave_pix_email || 'Solicite à academia';
  const titular = invoice.beneficiario_pix || beneficiarioPix;

  const handleCopyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const isPaid = invoice.status === 'paga';
  const isOverdue = invoice.status === 'atrasada';

  // WhatsApp de envio de comprovante
  const cleanPhone = (whatsappAcademia || invoice.chave_pix_whatsapp || '').replace(/\D/g, '');
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá! Segue o comprovante da minha mensalidade de ${invoice.competencia} no valor de ${formatCurrency(invoice.valor)}.`)}` : null;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.competenciaRow}>
          <Receipt size={18} color="#94A3B8" />
          <span className={styles.competencia}>Competência {invoice.competencia}</span>
        </div>

        <span
          className={`${styles.statusBadge} ${
            isPaid
              ? styles.statusPaga
              : isOverdue
              ? styles.statusAtrasada
              : styles.statusPendente
          }`}
        >
          {isPaid ? 'Paga' : isOverdue ? 'Atrasada' : 'Pendente'}
        </span>
      </div>

      <div className={styles.mainInfo}>
        <span className={styles.valor}>{formatCurrency(invoice.valor)}</span>
        <span className={styles.vencimento}>Vencimento: {formatDate(invoice.data_vencimento)}</span>
      </div>

      {!isPaid && (
        <div className={styles.pixBox}>
          <div className={styles.pixHeader}>
            <span>Chave PIX da Academia</span>
            {copied && <span style={{ color: '#34D399', fontWeight: 700 }}>Copiada!</span>}
          </div>

          {titular && (
            <div className={styles.pixTitularRow}>
              <span className={styles.pixTitularLabel}>Beneficiário:</span>
              <span className={styles.pixTitularNome}>{titular}</span>
            </div>
          )}

          <div className={styles.pixKeyRow}>
            <span className={styles.pixKeyText} title={pixKey}>
              {pixKey}
            </span>
            <button
              type="button"
              className={`${styles.copyPixBtn} ${copied ? styles.copyPixSuccess : ''}`}
              onClick={handleCopyPix}
              title="Copiar Chave PIX"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copiado' : 'Copiar PIX'}</span>
            </button>
          </div>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappProofBtn}
              title="Enviar Comprovante via WhatsApp"
            >
              <MessageSquare size={14} />
              <span>Enviar Comprovante no WhatsApp</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
