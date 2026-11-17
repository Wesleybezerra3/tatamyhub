import React, { useState, useEffect } from 'react';
import { X, Award, Calendar, FileText, Loader2 } from 'lucide-react';
import { BeltBadge } from '../BeltBadge/BeltBadge';
import styles from './GraduationModal.module.css';

const COMMON_BELTS = [
  'Branca',
  'Cinza',
  'Amarela',
  'Laranja',
  'Verde',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta',
  'Coral',
  'Vermelha'
];

export function GraduationModal({
  isOpen,
  onClose,
  onSave,
  studentName = '',
  modalities = [],
  defaultModalityId = null
}) {
  const [formData, setFormData] = useState({
    modalidade_id: '',
    faixa: 'Azul',
    graus: 0,
    data_graduacao: new Date().toISOString().split('T')[0],
    observacao: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const initialModId = defaultModalityId 
        ? String(defaultModalityId) 
        : (modalities[0]?.modalidade_id ? String(modalities[0].modalidade_id) : (modalities[0]?.id ? String(modalities[0].id) : ''));

      setFormData({
        modalidade_id: initialModId,
        faixa: 'Azul',
        graus: 0,
        data_graduacao: new Date().toISOString().split('T')[0],
        observacao: ''
      });
      setError(null);
    }
  }, [isOpen, defaultModalityId, modalities]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.modalidade_id) {
      setError('Selecione a modalidade da graduação.');
      return;
    }

    if (!formData.faixa) {
      setError('Selecione a nova faixa concedida.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        modalidade_id: parseInt(formData.modalidade_id, 10),
        faixa: formData.faixa,
        graus: parseInt(formData.graus, 10) || 0,
        data_graduacao: formData.data_graduacao,
        observacao: formData.observacao.trim() || null
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao registrar a graduação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.iconCircle}>
              <Award size={20} className={styles.headerIcon} />
            </div>
            <div>
              <h2 className={styles.title}>Graduar Aluno</h2>
              <p className={styles.subtitle}>{studentName || 'Registro de nova faixa ou graus'}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            {/* Modalidade */}
            <div className={styles.fieldGroup}>
              <label htmlFor="grad_modalidade_id" className={styles.label}>
                Modalidade *
              </label>
              <select
                id="grad_modalidade_id"
                name="modalidade_id"
                value={formData.modalidade_id}
                onChange={handleChange}
                required
                className={styles.select}
              >
                <option value="">Selecione a modalidade...</option>
                {modalities.map((m) => (
                  <option key={m.modalidade_id || m.id} value={m.modalidade_id || m.id}>
                    {m.modalidade_nome || m.nome}
                  </option>
                ))}
              </select>
            </div>

            {/* Nova Faixa e Graus */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="grad_faixa" className={styles.label}>
                  Nova Faixa *
                </label>
                <select
                  id="grad_faixa"
                  name="faixa"
                  value={formData.faixa}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {COMMON_BELTS.map((belt) => (
                    <option key={belt} value={belt}>
                      {belt}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="grad_graus" className={styles.label}>
                  Graus Concedidos
                </label>
                <select
                  id="grad_graus"
                  name="graus"
                  value={formData.graus}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value={0}>0 Grau (Lisa)</option>
                  <option value={1}>1º Grau</option>
                  <option value={2}>2º Grau</option>
                  <option value={3}>3º Grau</option>
                  <option value={4}>4º Grau</option>
                </select>
              </div>
            </div>

            {/* Preview visual da Faixa */}
            <div className={styles.previewContainer}>
              <span className={styles.previewLabel}>Visualização da Nova Graduação:</span>
              <BeltBadge faixa={formData.faixa} graus={formData.graus} size="lg" />
            </div>

            {/* Data da Cerimônia / Graduação */}
            <div className={styles.fieldGroup}>
              <label htmlFor="grad_data" className={styles.label}>
                Data da Graduação *
              </label>
              <div className={styles.inputWrapper}>
                <Calendar size={18} className={styles.inputIcon} />
                <input
                  id="grad_data"
                  name="data_graduacao"
                  type="date"
                  required
                  value={formData.data_graduacao}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
            </div>

            {/* Observações / Cerimônia */}
            <div className={styles.fieldGroup}>
              <label htmlFor="grad_obs" className={styles.label}>
                Observações da Promoção (Opcional)
              </label>
              <textarea
                id="grad_obs"
                name="observacao"
                rows={2}
                placeholder="Ex: Exame de graduação do fim de ano, medalha de ouro no campeonato..."
                value={formData.observacao}
                onChange={handleChange}
                className={styles.textarea}
              />
            </div>
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className={styles.spinning} />
                  <span>Registrando...</span>
                </>
              ) : (
                <span>Confirmar Graduação</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
