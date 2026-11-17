import React, { useState } from 'react';
import { X, Layers, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financialService } from '../../../services/financialService';
import styles from './BatchGenerateModal.module.css';

export function BatchGenerateModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [competencia, setCompetencia] = useState(currentMonthStr);
  const [diaVencimento, setDiaVencimento] = useState(10);
  const [valorPadrao, setValorPadrao] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!competencia) {
      setError('Informe o mês de competência.');
      return;
    }

    const dia = parseInt(diaVencimento, 10);
    if (isNaN(dia) || dia < 1 || dia > 31) {
      setError('O dia de vencimento deve ser entre 1 e 31.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        competencia,
        dia_vencimento: dia
      };

      if (valorPadrao) {
        const numVal = parseFloat(valorPadrao);
        if (!isNaN(numVal) && numVal > 0) {
          payload.valor_padrao = numVal;
        }
      }

      const result = await financialService.generateBatchInvoices(payload);
      if (onSuccess) {
        onSuccess(result);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao gerar faturas em lote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconCircle}>
              <Layers size={20} className={styles.titleIcon} />
            </div>
            <div>
              <h2 className={styles.title}>Gerar Mensalidades do Mês</h2>
              <p className={styles.subtitle}>Geração em lote para todos os alunos ativos</p>
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

        {error && (
          <div className={styles.errorAlert}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className={styles.infoBox}>
          <span>
            O sistema gerará faturas automaticamente para os alunos com <strong>cobrança contínua ativa</strong>, respeitando o <strong>valor da mensalidade</strong> e o <strong>dia de vencimento</strong> definidos no plano de cada aluno (dentro do período de validade). Alunos que já possuem fatura no mês serão ignorados com segurança (idempotência).
          </span>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="competencia" className={styles.label}>
              Mês / Ano de Competência <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <Calendar size={18} className={styles.inputIcon} />
              <input
                id="competencia"
                type="month"
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                className={styles.inputWithIcon}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="diaVencimento" className={styles.label}>
              Dia de Vencimento (1 a 31) <span className={styles.required}>*</span>
            </label>
            <input
              id="diaVencimento"
              type="number"
              min="1"
              max="31"
              value={diaVencimento}
              onChange={(e) => setDiaVencimento(e.target.value)}
              className={styles.input}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="valorPadrao" className={styles.label}>
              Valor Padrão Opcional (R$)
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputPrefix}>R$</span>
              <input
                id="valorPadrao"
                type="number"
                step="0.01"
                min="0.01"
                value={valorPadrao}
                onChange={(e) => setValorPadrao(e.target.value)}
                className={styles.inputWithPrefix}
                placeholder="150,00 (deixe em branco para usar o valor da modalidade)"
                disabled={loading}
              />
            </div>
            <span className={styles.helperText}>
              Se não preenchido, o sistema usará a mensalidade padrão cadastrada na modalidade do aluno.
            </span>
          </div>

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
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Layers size={18} />
                  <span>Gerar para Alunos Ativos</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
