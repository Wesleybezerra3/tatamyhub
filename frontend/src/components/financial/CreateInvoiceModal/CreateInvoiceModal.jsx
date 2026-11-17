import React, { useState, useEffect } from 'react';
import { X, FilePlus, User, Calendar, DollarSign, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { financialService } from '../../../services/financialService';
import { studentService } from '../../../services/studentService';
import styles from './CreateInvoiceModal.module.css';

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  if (!isOpen) return null;

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Default due date to day 10 of current month, or 5 days from now
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 5);
  const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0];

  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const [formData, setFormData] = useState({
    aluno_id: '',
    valor: '',
    data_vencimento: defaultDueDateStr,
    competencia: currentMonthStr,
    observacoes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadStudents() {
      setLoadingStudents(true);
      try {
        const list = await studentService.listStudents({ status: 'ativo' });
        setStudents(list);
        if (list.length > 0 && !formData.aluno_id) {
          const first = list[0];
          setFormData((prev) => {
            const next = { ...prev, aluno_id: String(first.id) };
            if (first.valor_mensalidade) {
              next.valor = String(first.valor_mensalidade);
            }
            if (first.dia_vencimento && prev.competencia) {
              const [yyyy, mm] = prev.competencia.split('-');
              if (yyyy && mm) {
                next.data_vencimento = `${yyyy}-${mm}-${String(first.dia_vencimento).padStart(2, '0')}`;
              }
            }
            return next;
          });
        }
      } catch (err) {
        setError('Não foi possível carregar a lista de alunos ativos.');
      } finally {
        setLoadingStudents(false);
      }
    }
    loadStudents();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'aluno_id') {
      const sel = students.find(s => String(s.id) === String(value));
      setFormData((prev) => {
        const next = { ...prev, aluno_id: value };
        if (sel?.valor_mensalidade) {
          next.valor = String(sel.valor_mensalidade);
        }
        if (sel?.dia_vencimento && prev.competencia) {
          const [yyyy, mm] = prev.competencia.split('-');
          if (yyyy && mm) {
            next.data_vencimento = `${yyyy}-${mm}-${String(sel.dia_vencimento).padStart(2, '0')}`;
          }
        }
        return next;
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numValue = parseFloat(formData.valor);

    if (!formData.aluno_id) {
      setError('Selecione um aluno para a fatura.');
      return;
    }

    if (isNaN(numValue) || numValue <= 0) {
      setError('Informe um valor de fatura válido maior que zero.');
      return;
    }

    if (!formData.data_vencimento) {
      setError('Informe a data de vencimento.');
      return;
    }

    if (!formData.competencia) {
      setError('Informe a competência (ex: 2026-11).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await financialService.createInvoice({
        aluno_id: Number(formData.aluno_id),
        valor: numValue,
        data_vencimento: formData.data_vencimento,
        competencia: formData.competencia,
        observacoes: formData.observacoes.trim() || undefined
      });

      if (onSuccess) {
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao emitir mensalidade avulsa.');
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
              <FilePlus size={20} className={styles.titleIcon} />
            </div>
            <div>
              <h2 className={styles.title}>Nova Fatura Avulsa</h2>
              <p className={styles.subtitle}>Emitir cobrança individual de mensalidade</p>
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

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Aluno */}
          <div className={styles.formGroup}>
            <label htmlFor="aluno_id" className={styles.label}>
              Aluno <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <User size={18} className={styles.inputIcon} />
              <select
                id="aluno_id"
                name="aluno_id"
                value={formData.aluno_id}
                onChange={handleChange}
                className={styles.selectWithIcon}
                required
                disabled={loading || loadingStudents}
              >
                {loadingStudents ? (
                  <option value="">Carregando alunos...</option>
                ) : (
                  students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nome} {student.faixa_atual ? `(${student.faixa_atual})` : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Valor */}
          <div className={styles.formGroup}>
            <label htmlFor="valor" className={styles.label}>
              Valor da Fatura (R$) <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputPrefix}>R$</span>
              <input
                id="valor"
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.valor}
                onChange={handleChange}
                className={styles.input}
                placeholder="150,00"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Competência e Vencimento em Grid */}
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label htmlFor="competencia" className={styles.label}>
                Competência <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  id="competencia"
                  name="competencia"
                  type="month"
                  value={formData.competencia}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="data_vencimento" className={styles.label}>
                Data de Vencimento <span className={styles.required}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  id="data_vencimento"
                  name="data_vencimento"
                  type="date"
                  value={formData.data_vencimento}
                  onChange={handleChange}
                  className={styles.inputWithIcon}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className={styles.formGroup}>
            <label htmlFor="observacoes" className={styles.label}>Observações (Opcional)</label>
            <textarea
              id="observacoes"
              name="observacoes"
              rows={2}
              value={formData.observacoes}
              onChange={handleChange}
              className={styles.textarea}
              placeholder="Ex: Mensalidade proporcional referente ao ingresso em meio de mês"
              disabled={loading}
            />
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
                  <span>Emitindo...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  <span>Emitir Fatura</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
