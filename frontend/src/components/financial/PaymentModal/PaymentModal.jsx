import React, { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Banknote, QrCode, Calendar, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { financialService } from '../../../services/financialService';
import styles from './PaymentModal.module.css';

const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', icon: QrCode },
  { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { id: 'cartao_credito', label: 'Crédito', icon: CreditCard },
  { id: 'cartao_debito', label: 'Débito', icon: CreditCard },
];

export function PaymentModal({ isOpen, onClose, invoice, onSuccess }) {
  if (!isOpen || !invoice) return null;

  const remainingBalance = Number(invoice.saldo_devedor !== undefined ? invoice.saldo_devedor : invoice.valor) || 0;

  const [amount, setAmount] = useState(remainingBalance.toFixed(2));
  const [method, setMethod] = useState('pix');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (invoice) {
      const rem = Number(invoice.saldo_devedor !== undefined ? invoice.saldo_devedor : invoice.valor) || 0;
      setAmount(rem.toFixed(2));
      setMethod('pix');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError(null);
    }
  }, [invoice]);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSetFullAmount = () => {
    setAmount(remainingBalance.toFixed(2));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Informe um valor de pagamento válido maior que zero.');
      return;
    }

    if (numAmount > remainingBalance + 0.001) {
      setError(`O valor não pode exceder o saldo devedor (${formatCurrency(remainingBalance)}).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await financialService.registerPayment(invoice.id, {
        valor_pago: numAmount,
        forma_pagamento: method,
        data_pagamento: paymentDate,
        observacoes: notes.trim() || undefined
      });

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao registrar pagamento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconCircle}>
              <DollarSign size={20} className={styles.titleIcon} />
            </div>
            <div>
              <h2 className={styles.title}>Registrar Pagamento</h2>
              <p className={styles.subtitle}>{invoice.aluno_nome}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Fechar"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* Invoice Summary Box */}
        <div className={styles.invoiceSummary}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Competência</span>
            <span className={styles.summaryValue}>{invoice.competencia}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Valor da Fatura</span>
            <span className={styles.summaryValue}>{formatCurrency(invoice.valor)}</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>Saldo Devedor</span>
            <span className={`${styles.summaryValue} ${styles.balanceHighlight}`}>
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Valor */}
          <div className={styles.formGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="amount" className={styles.label}>
                Valor a Receber (R$) <span className={styles.required}>*</span>
              </label>
              <button
                type="button"
                className={styles.fullAmountBtn}
                onClick={handleSetFullAmount}
              >
                Quitação Total
              </button>
            </div>
            <div className={styles.inputWrapper}>
              <span className={styles.inputPrefix}>R$</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remainingBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={styles.input}
                placeholder="0,00"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Forma de Pagamento */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Forma de Pagamento</label>
            <div className={styles.methodGrid}>
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={`${styles.methodBtn} ${isSelected ? styles.methodBtnActive : ''}`}
                    onClick={() => setMethod(m.id)}
                    disabled={loading}
                  >
                    <Icon size={18} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data de Pagamento */}
          <div className={styles.formGroup}>
            <label htmlFor="paymentDate" className={styles.label}>Data do Recebimento</label>
            <div className={styles.inputWrapper}>
              <Calendar size={18} className={styles.inputIcon} />
              <input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className={styles.inputWithIcon}
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Observações */}
          <div className={styles.formGroup}>
            <label htmlFor="notes" className={styles.label}>Observações (Opcional)</label>
            <textarea
              id="notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
              placeholder="Ex: Pago via PIX transferido pela mãe do aluno"
              disabled={loading}
            />
          </div>

          {/* Botões de Ação */}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.confirmBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>Registrando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Confirmar Recebimento</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
