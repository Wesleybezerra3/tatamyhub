import React, { useState, useEffect } from 'react';
import { X, User, Phone, Calendar, Shield, Activity, Loader2, DollarSign, Repeat, Clock } from 'lucide-react';
import styles from './StudentModal.module.css';

const COMMON_BELTS = [
  'Branca',
  'Cinza',
  'Amarela',
  'Laranja',
  'Verde',
  'Azul',
  'Roxa',
  'Marrom',
  'Preta'
];

export function StudentModal({ isOpen, onClose, onSave, initialData = null, modalities = [] }) {
  const isEditing = !!initialData?.id;

  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    data_nascimento: '',
    data_matricula: new Date().toISOString().split('T')[0],
    modalidade_id: '',
    faixa_inicial: 'Branca',
    graus_inicial: 0,
    observacoes_medicas: '',
    status: 'ativo',
    cobranca_continua: true,
    valor_mensalidade: '150.00',
    dia_vencimento: 10,
    validade_plano: '',
    gerar_primeira_mensalidade: true,
    inicio_cobranca: 'auto'
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nome: initialData.nome || '',
        telefone: initialData.telefone || '',
        data_nascimento: initialData.data_nascimento ? initialData.data_nascimento.split('T')[0] : '',
        data_matricula: initialData.data_matricula ? initialData.data_matricula.split('T')[0] : new Date().toISOString().split('T')[0],
        modalidade_id: initialData.modalidade_id || (modalities[0]?.id ? String(modalities[0].id) : ''),
        faixa_inicial: initialData.faixa_atual || 'Branca',
        graus_inicial: initialData.graus_atual || 0,
        observacoes_medicas: initialData.observacoes_medicas || '',
        status: initialData.status || 'ativo',
        cobranca_continua: initialData.cobranca_continua !== undefined ? Boolean(initialData.cobranca_continua) : true,
        valor_mensalidade: initialData.valor_mensalidade !== null && initialData.valor_mensalidade !== undefined ? initialData.valor_mensalidade : '150.00',
        dia_vencimento: initialData.dia_vencimento || 10,
        validade_plano: initialData.validade_plano ? initialData.validade_plano.split('T')[0] : '',
        gerar_primeira_mensalidade: false,
        inicio_cobranca: 'auto'
      });
    } else {
      setFormData({
        nome: '',
        telefone: '',
        data_nascimento: '',
        data_matricula: new Date().toISOString().split('T')[0],
        modalidade_id: modalities[0]?.id ? String(modalities[0].id) : '',
        faixa_inicial: 'Branca',
        graus_inicial: 0,
        observacoes_medicas: '',
        status: 'ativo',
        cobranca_continua: true,
        valor_mensalidade: '150.00',
        dia_vencimento: 10,
        validade_plano: '',
        gerar_primeira_mensalidade: true,
        inicio_cobranca: 'auto'
      });
    }
    setError(null);
  }, [initialData, modalities, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.nome.trim()) {
      setError('O nome do aluno é obrigatório.');
      return;
    }

    if (!isEditing && !formData.modalidade_id) {
      setError('Selecione uma modalidade para a matrícula do aluno.');
      return;
    }

    setSubmitting(true);
    try {
      await onSave({
        ...formData,
        modalidade_id: formData.modalidade_id ? parseInt(formData.modalidade_id, 10) : undefined,
        graus_inicial: parseInt(formData.graus_inicial, 10) || 0,
        cobranca_continua: formData.cobranca_continua,
        valor_mensalidade: formData.valor_mensalidade !== '' && formData.valor_mensalidade !== null ? parseFloat(formData.valor_mensalidade) : null,
        dia_vencimento: parseInt(formData.dia_vencimento, 10) || 10,
        validade_plano: formData.validade_plano || null,
        gerar_primeira_mensalidade: formData.gerar_primeira_mensalidade,
        gerar_mensalidade_mes: formData.gerar_primeira_mensalidade,
        inicio_cobranca: formData.inicio_cobranca
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Erro ao salvar os dados do aluno.');
    } finally {
      setSubmitting(false);
    }
  };

  const matriculaDate = formData.data_matricula ? new Date(formData.data_matricula + 'T12:00:00') : new Date();
  const diaMatr = matriculaDate.getDate();
  const diaVenc = parseInt(formData.dia_vencimento, 10) || 10;
  const vencimentoJaPassou = diaVenc < diaMatr;

  const proxMesDate = new Date(matriculaDate.getFullYear(), matriculaDate.getMonth() + 1, 1);
  const mesAtualStr = `${String(matriculaDate.getMonth() + 1).padStart(2, '0')}/${matriculaDate.getFullYear()}`;
  const proxMesStr = `${String(proxMesDate.getMonth() + 1).padStart(2, '0')}/${proxMesDate.getFullYear()}`;

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerTitleGroup}>
            <div className={styles.iconCircle}>
              <User size={20} className={styles.headerIcon} />
            </div>
            <div>
              <h2 className={styles.title}>
                {isEditing ? 'Editar Aluno' : 'Novo Aluno no Tatame'}
              </h2>
              <p className={styles.subtitle}>
                {isEditing ? 'Atualize as informações cadastrais' : 'Preencha os dados de matrícula e faixa inicial'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.scrollArea}>
            {/* Nome Completo */}
            <div className={styles.fieldGroup}>
              <label htmlFor="nome" className={styles.label}>
                Nome Completo *
              </label>
              <div className={styles.inputWrapper}>
                <User size={18} className={styles.inputIcon} />
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  placeholder="Ex: Carlos Gracie Filho"
                  value={formData.nome}
                  onChange={handleChange}
                  className={styles.input}
                  autoFocus
                />
              </div>
            </div>

            {/* Telefone / WhatsApp */}
            <div className={styles.fieldGroup}>
              <label htmlFor="telefone" className={styles.label}>
                WhatsApp / Celular
              </label>
              <div className={styles.inputWrapper}>
                <Phone size={18} className={styles.inputIcon} />
                <input
                  id="telefone"
                  name="telefone"
                  type="tel"
                  placeholder="(11) 98765-4321"
                  value={formData.telefone}
                  onChange={handleChange}
                  className={styles.input}
                />
              </div>
              <span className={styles.helperText}>Usado para o atalho de contato com 1 toque</span>
            </div>

            {/* Linha dupla: Datas */}
            <div className={styles.row}>
              <div className={styles.fieldGroup}>
                <label htmlFor="data_nascimento" className={styles.label}>
                  Data de Nascimento
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar size={18} className={styles.inputIcon} />
                  <input
                    id="data_nascimento"
                    name="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label htmlFor="data_matricula" className={styles.label}>
                  Data da Matrícula *
                </label>
                <div className={styles.inputWrapper}>
                  <Calendar size={18} className={styles.inputIcon} />
                  <input
                    id="data_matricula"
                    name="data_matricula"
                    type="date"
                    required
                    value={formData.data_matricula}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            {/* Se for Novo Cadastro, define Modalidade e Faixa Inicial */}
            {!isEditing && (
              <div className={styles.modalidadeSection}>
                <div className={styles.sectionDivider}>
                  <span>Modalidade & Graduação de Entrada</span>
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="modalidade_id" className={styles.label}>
                    Modalidade Praticada *
                  </label>
                  <select
                    id="modalidade_id"
                    name="modalidade_id"
                    value={formData.modalidade_id}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="">Selecione a modalidade...</option>
                    {modalities.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.row}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="faixa_inicial" className={styles.label}>
                      Faixa Atual
                    </label>
                    <select
                      id="faixa_inicial"
                      name="faixa_inicial"
                      value={formData.faixa_inicial}
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
                    <label htmlFor="graus_inicial" className={styles.label}>
                      Graus (Listras)
                    </label>
                    <select
                      id="graus_inicial"
                      name="graus_inicial"
                      value={formData.graus_inicial}
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
              </div>
            )}

            {/* Seção de Cobrança Contínua e Plano Mensal */}
            <div className={styles.modalidadeSection}>
              <div className={styles.sectionDivider}>
                <span>Cobrança Contínua & Mensalidade</span>
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="cobranca_continua"
                    checked={formData.cobranca_continua}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  <div>
                    <span className={styles.checkboxTitle}>Cobrança Contínua Automática todo mês</span>
                    <p className={styles.checkboxDesc}>
                      O aluno entra na geração de faturas a cada mês com seu valor e vencimento definidos, a menos que haja alteração.
                    </p>
                  </div>
                </label>
              </div>

              {formData.cobranca_continua && (
                <>
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="valor_mensalidade" className={styles.label}>
                        Valor da Mensalidade (R$)
                      </label>
                      <div className={styles.inputWrapper}>
                        <DollarSign size={18} className={styles.inputIcon} />
                        <input
                          id="valor_mensalidade"
                          name="valor_mensalidade"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Ex: 150,00"
                          value={formData.valor_mensalidade}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      <span className={styles.helperText}>Valor cobrado todo mês</span>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="dia_vencimento" className={styles.label}>
                        Dia de Vencimento (1 a 31)
                      </label>
                      <div className={styles.inputWrapper}>
                        <Clock size={18} className={styles.inputIcon} />
                        <input
                          id="dia_vencimento"
                          name="dia_vencimento"
                          type="number"
                          min="1"
                          max="31"
                          placeholder="Ex: 10"
                          value={formData.dia_vencimento}
                          onChange={handleChange}
                          className={styles.input}
                        />
                      </div>
                      <span className={styles.helperText}>Dia do mês em que vence</span>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="validade_plano" className={styles.label}>
                      Data de Validade do Plano (Opcional)
                    </label>
                    <div className={styles.inputWrapper}>
                      <Calendar size={18} className={styles.inputIcon} />
                      <input
                        id="validade_plano"
                        name="validade_plano"
                        type="date"
                        value={formData.validade_plano}
                        onChange={handleChange}
                        className={styles.input}
                      />
                    </div>
                    <span className={styles.helperText}>
                      Deixe vazio para cobrança contínua por tempo indeterminado (até alteração)
                    </span>
                  </div>

                  {/* Gerar fatura imediatamente */}
                  <div className={styles.fieldGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="gerar_primeira_mensalidade"
                        checked={formData.gerar_primeira_mensalidade}
                        onChange={handleChange}
                        className={styles.checkbox}
                      />
                      <div>
                        <span className={styles.checkboxTitle}>
                          {isEditing 
                            ? 'Gerar mensalidade deste mês (se ainda não existir)' 
                            : 'Anexar e emitir primeira mensalidade no cadastro'}
                        </span>
                        <p className={styles.checkboxDesc}>
                          Gera imediatamente a fatura do aluno em "Mensalidades & Finanças" para cobrança ou quitação.
                        </p>
                      </div>
                    </label>
                  </div>

                  {formData.gerar_primeira_mensalidade && (
                    <div className={styles.fieldGroup}>
                      <label htmlFor="inicio_cobranca" className={styles.label}>
                        Competência da Primeira Mensalidade
                      </label>
                      <select
                        id="inicio_cobranca"
                        name="inicio_cobranca"
                        value={formData.inicio_cobranca}
                        onChange={handleChange}
                        className={styles.select}
                      >
                        <option value="auto">
                          Automático {vencimentoJaPassou ? `(Iniciar no próximo mês: ${proxMesStr})` : `(Iniciar neste mês: ${mesAtualStr})`}
                        </option>
                        <option value="proximo_mes">
                          A partir do próximo mês ({proxMesStr} - Vencimento {String(diaVenc).padStart(2, '0')}/{String(proxMesDate.getMonth() + 1).padStart(2, '0')})
                        </option>
                        <option value="mes_atual">
                          Neste mês de matrícula ({mesAtualStr} - Vencimento {String(diaVenc).padStart(2, '0')}/{String(matriculaDate.getMonth() + 1).padStart(2, '0')})
                        </option>
                      </select>

                      {vencimentoJaPassou && (formData.inicio_cobranca === 'auto' || formData.inicio_cobranca === 'proximo_mes') ? (
                        <div className={styles.infoAlert}>
                          <span>
                            💡 O dia de vencimento escolhido (dia {diaVenc}) já passou em relação à data de matrícula (dia {diaMatr}). A cobrança iniciará no próximo mês ({proxMesStr}) com status <strong>Pendente</strong>, evitando fatura vencida no cadastro.
                          </span>
                        </div>
                      ) : (
                        <div className={styles.infoAlert}>
                          <span>
                            Cobrança programada para {formData.inicio_cobranca === 'proximo_mes' ? proxMesStr : mesAtualStr} com vencimento no dia {diaVenc}.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Observações Médicas */}
            <div className={styles.fieldGroup}>
              <label htmlFor="observacoes_medicas" className={styles.label}>
                Observações Médicas & Alertas de Lesão
              </label>
              <textarea
                id="observacoes_medicas"
                name="observacoes_medicas"
                rows={2}
                placeholder="Ex: Cirurgia no ligamento do joelho esquerdo, alergia a esparadrapo..."
                value={formData.observacoes_medicas}
                onChange={handleChange}
                className={styles.textarea}
              />
            </div>

            {/* Status (Apenas na edição) */}
            {isEditing && (
              <div className={styles.fieldGroup}>
                <label htmlFor="status" className={styles.label}>
                  Status no Tatame
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="ativo">Ativo (Treinando regularmente)</option>
                  <option value="inativo">Inativo (Trancado / Afastado)</option>
                </select>
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className={styles.saveBtn} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={16} className={styles.spinning} />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>{isEditing ? 'Salvar Alterações' : 'Concluir Matrícula'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
