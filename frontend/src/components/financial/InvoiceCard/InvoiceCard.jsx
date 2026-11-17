import React from 'react';
import { MessageSquare, CheckCircle2, Clock, AlertTriangle, DollarSign, Calendar, User } from 'lucide-react';
import { BeltBadge } from '../../students/BeltBadge/BeltBadge';
import styles from './InvoiceCard.module.css';

export function InvoiceCard({ invoice, onPay, onWhatsAppBilling }) {
  const {
    id,
    aluno_nome,
    aluno_telefone,
    aluno_faixa,
    aluno_graus,
    modalidade_nome,
    valor,
    valor_pago,
    saldo_devedor,
    data_vencimento,
    competencia,
    status
  } = invoice;

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const cleanDate = dateStr.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const isPaid = status === 'paga';
  const isOverdue = status === 'atrasada';
  const isCancelled = status === 'cancelada';
  const isPartial = valor_pago > 0 && !isPaid;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (onWhatsAppBilling) {
      onWhatsAppBilling(invoice);
    }
  };

  const handlePay = (e) => {
    e.stopPropagation();
    if (onPay) {
      onPay(invoice);
    }
  };

  return (
    <div className={`${styles.card} ${styles[status]}`}>
      {/* Linha Superior: Aluno e Status */}
      <div className={styles.headerRow}>
        <div className={styles.studentInfo}>
          <div className={styles.nameRow}>
            <h3 className={styles.studentName}>{aluno_nome}</h3>
            {aluno_faixa && (
              <BeltBadge faixa={aluno_faixa} graus={aluno_graus || 0} size="sm" />
            )}
          </div>
          <span className={styles.metaSubtitle}>
            {modalidade_nome ? `${modalidade_nome} • ` : ''}Competência {competencia}
            {invoice.observacoes?.includes('Cobrança Contínua') ? ' • Recorrente' : ''}
          </span>
        </div>

        <div className={`${styles.statusBadge} ${styles[`status_${status}`]}`}>
          {isPaid && <CheckCircle2 size={14} />}
          {isOverdue && <AlertTriangle size={14} />}
          {status === 'pendente' && <Clock size={14} />}
          <span>
            {status === 'paga' && 'Paga'}
            {status === 'atrasada' && 'Atrasada'}
            {status === 'pendente' && 'Pendente'}
            {status === 'cancelada' && 'Cancelada'}
          </span>
        </div>
      </div>

      {/* Linha do Meio: Vencimento e Valores */}
      <div className={styles.detailsRow}>
        <div className={styles.dueDateCol}>
          <span className={styles.label}>Vencimento</span>
          <div className={styles.dueDateValue}>
            <Calendar size={14} className={styles.dateIcon} />
            <span className={isOverdue ? styles.overdueDate : ''}>
              {formatDate(data_vencimento)}
            </span>
          </div>
        </div>

        <div className={styles.valuesCol}>
          <div className={styles.mainValueRow}>
            <span className={styles.label}>
              {isPaid ? 'Total Pago' : (isPartial ? 'Saldo Restante' : 'Valor')}
            </span>
            <span className={`${styles.valueAmount} ${isOverdue ? styles.overdueAmount : ''} ${isPaid ? styles.paidAmount : ''}`}>
              {formatCurrency(isPaid ? valor_pago : (saldo_devedor > 0 ? saldo_devedor : valor))}
            </span>
          </div>

          {isPartial && (
            <span className={styles.partialNote}>
              Original: {formatCurrency(valor)} (Pago: {formatCurrency(valor_pago)})
            </span>
          )}
        </div>
      </div>

      {/* Linha Inferior: Ações Táteis */}
      {!isCancelled && (
        <div className={styles.actionsRow}>
          {!isPaid ? (
            <>
              {/* Botão de Cobrança WhatsApp (Se tiver telefone e saldo em aberto) */}
              {aluno_telefone && (
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className={styles.whatsappBtn}
                  title="Enviar lembrete amigável no WhatsApp"
                  aria-label={`Cobrar ${aluno_nome} no WhatsApp`}
                >
                  <MessageSquare size={16} />
                  <span>Cobrar no WhatsApp</span>
                </button>
              )}

              {/* Botão Baixa de Pagamento */}
              <button
                type="button"
                onClick={handlePay}
                className={styles.payBtn}
                title="Registrar recebimento financeiro"
              >
                <DollarSign size={16} />
                <span>Receber / Baixar</span>
              </button>
            </>
          ) : (
            <div className={styles.paidConfirmation}>
              <CheckCircle2 size={16} className={styles.paidIcon} />
              <span>Quitada integralmente</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
