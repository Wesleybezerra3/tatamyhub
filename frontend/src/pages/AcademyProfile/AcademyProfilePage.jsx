import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Phone, MapPin, Save, Loader2, Check, AlertTriangle, Trash2, X, Lock, QrCode, Copy, MessageSquare, RotateCcw, Sparkles } from 'lucide-react';
import { useAcademy } from '../../hooks/useAcademy';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { LogoUploader } from '../../components/common/LogoUploader/LogoUploader';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './AcademyProfilePage.module.css';

const DEFAULT_BILLING_TEMPLATES = {
  pendente: 'Oss, {primeiro_nome}! Tudo bem? Passando para lembrar da sua mensalidade ({competencia}) na {academia_nome}, no valor de {valor}, com vencimento em {vencimento}.{chave_pix_bloco}\n\nAo realizar o pagamento, favor enviar o comprovante por aqui. Muito obrigado e bons treinos! 🥋',
  atrasada: 'Oss, {primeiro_nome}! Tudo bem? Constatamos que a sua mensalidade ({competencia}) na {academia_nome}, no valor de {valor} (vencida em {vencimento}), encontra-se em aberto.{chave_pix_bloco}\n\nCaso já tenha realizado o pagamento, por favor nos envie o comprovante. Qualquer dúvida estamos à disposição! 🥋'
};

const AVAILABLE_TAGS = [
  { tag: '{primeiro_nome}', desc: 'Primeiro nome (ex: Marlon)' },
  { tag: '{aluno_nome}', desc: 'Nome completo' },
  { tag: '{valor}', desc: 'Valor da mensalidade (R$)' },
  { tag: '{vencimento}', desc: 'Data de vencimento' },
  { tag: '{competencia}', desc: 'Competência (MM/AAAA)' },
  { tag: '{academia_nome}', desc: 'Nome da academia' },
  { tag: '{chave_pix}', desc: 'Chave PIX' },
  { tag: '{beneficiario_pix}', desc: 'Titular do PIX' },
  { tag: '{chave_pix_bloco}', desc: 'Bloco PIX + Titular' }
];

export function AcademyProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { profile, loading, saving, error: hookError, saveProfile, uploadLogo, removeLogo } = useAcademy();

  const [formData, setFormData] = useState({
    nome: '',
    documento: '',
    email: '',
    telefone: '',
    whatsapp: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    chave_pix: '',
    tipo_chave_pix: 'aleatoria',
    beneficiario_pix: '',
    msg_cobranca_pendente: '',
    msg_cobranca_atrasada: ''
  });

  const [activeMsgTab, setActiveMsgTab] = useState('pendente');
  const [feedback, setFeedback] = useState(null);

  // Estados para exclusão de conta em cascata (Danger Zone)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        documento: profile.documento || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        whatsapp: profile.whatsapp || '',
        logradouro: profile.logradouro || '',
        numero: profile.numero || '',
        complemento: profile.complemento || '',
        bairro: profile.bairro || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        cep: profile.cep || '',
        chave_pix: profile.chave_pix || '',
        tipo_chave_pix: profile.tipo_chave_pix || 'aleatoria',
        beneficiario_pix: profile.beneficiario_pix || '',
        msg_cobranca_pendente: profile.msg_cobranca_pendente || DEFAULT_BILLING_TEMPLATES.pendente,
        msg_cobranca_atrasada: profile.msg_cobranca_atrasada || DEFAULT_BILLING_TEMPLATES.atrasada
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInsertTag = (fieldName, tag) => {
    setFormData(prev => {
      const current = prev[fieldName] || '';
      return {
        ...prev,
        [fieldName]: current ? `${current} ${tag}` : tag
      };
    });
  };

  const handleRestoreTemplate = (fieldName) => {
    const key = fieldName === 'msg_cobranca_pendente' ? 'pendente' : 'atrasada';
    setFormData(prev => ({
      ...prev,
      [fieldName]: DEFAULT_BILLING_TEMPLATES[key]
    }));
  };

  const renderPreviewMessage = (templateKey) => {
    const rawTemplate = templateKey === 'pendente'
      ? (formData.msg_cobranca_pendente || DEFAULT_BILLING_TEMPLATES.pendente)
      : (formData.msg_cobranca_atrasada || DEFAULT_BILLING_TEMPLATES.atrasada);

    const chavePix = formData.chave_pix?.trim() || 'contato@academia.com.br';
    const titular = formData.beneficiario_pix?.trim() || formData.nome?.trim() || 'Academia';
    const pixBloco = chavePix ? `\n\nChave PIX: ${chavePix}${titular ? ` (${titular})` : ''}` : '';

    return rawTemplate
      .replaceAll('{primeiro_nome}', 'Carlos')
      .replaceAll('{aluno_nome}', 'Carlos Eduardo Silva')
      .replaceAll('{valor}', 'R$ 150,00')
      .replaceAll('{vencimento}', '20/11/2026')
      .replaceAll('{competencia}', '11/2026')
      .replaceAll('{academia_nome}', formData.nome?.trim() || 'Tatamy Hub')
      .replaceAll('{chave_pix}', chavePix)
      .replaceAll('{beneficiario_pix}', titular)
      .replaceAll('{chave_pix_bloco}', pixBloco);
  };

  const getPixPlaceholder = (type) => {
    switch (type) {
      case 'cpf':
        return '000.000.000-00';
      case 'cnpj':
        return '00.000.000/0001-00';
      case 'email':
        return 'financeiro@suaacademia.com.br';
      case 'telefone':
        return '(11) 98765-4321';
      case 'aleatoria':
      default:
        return '123e4567-e89b-12d3-a456-426614174000';
    }
  };

  const getQuickFillOption = () => {
    if (formData.tipo_chave_pix === 'cnpj' && formData.documento?.trim()) {
      return { label: 'CNPJ do cadastro', value: formData.documento.trim() };
    }
    if (formData.tipo_chave_pix === 'cpf' && formData.documento?.trim()) {
      return { label: 'CPF do cadastro', value: formData.documento.trim() };
    }
    if (formData.tipo_chave_pix === 'email' && formData.email?.trim()) {
      return { label: 'E-mail do cadastro', value: formData.email.trim() };
    }
    if (formData.tipo_chave_pix === 'telefone' && (formData.whatsapp?.trim() || formData.telefone?.trim())) {
      const tel = formData.whatsapp?.trim() || formData.telefone?.trim();
      return { label: 'Telefone do cadastro', value: tel };
    }
    return null;
  };

  const quickFill = getQuickFillOption();

  const handleQuickFillPix = () => {
    if (quickFill?.value) {
      setFormData(prev => ({ ...prev, chave_pix: quickFill.value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    // Validações locais amigáveis
    if (!formData.nome.trim()) {
      setFeedback({ type: 'error', message: 'O nome da academia é obrigatório.' });
      return;
    }

    if (!formData.telefone.trim() && !formData.whatsapp.trim()) {
      setFeedback({ type: 'error', message: 'Informe ao menos um meio de contato (telefone ou WhatsApp).' });
      return;
    }

    try {
      await saveProfile(formData);
      setFeedback({ type: 'success', message: 'Dados da academia atualizados com sucesso!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Falha ao salvar as informações.' });
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Informe sua senha para confirmar a exclusão.');
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR') {
      setDeleteError('Digite a palavra "EXCLUIR" em maiúsculo para confirmar.');
      return;
    }

    try {
      setDeletingAccount(true);
      await authService.deleteAccount({ senha: deletePassword });
      setIsDeleteModalOpen(false);
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Erro ao excluir conta. Verifique sua senha.');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={36} />
        <p>Carregando perfil da academia...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Perfil da Academia</h1>
        <p className={styles.pageSubtitle}>
          Configure as informações institucionais, identidade visual e canais de atendimento.
        </p>
      </header>

      {feedback && (
        <Alert 
          type={feedback.type} 
          message={feedback.message} 
          onClose={() => setFeedback(null)} 
        />
      )}

      {hookError && !feedback && (
        <Alert 
          type="error" 
          message={hookError} 
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Identidade Visual & Logotipo */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Building size={18} className={styles.sectionIcon} />
            <h2>Identidade Institucional</h2>
          </div>

          <LogoUploader
            currentLogoUrl={profile?.logo_url}
            academyName={formData.nome}
            onUpload={uploadLogo}
            onRemove={removeLogo}
            disabled={saving}
          />

          <div className={styles.field}>
            <label htmlFor="nome">
              Nome da Academia <span className={styles.required}>*</span>
            </label>
            <input
              id="nome"
              name="nome"
              type="text"
              placeholder="Ex: Gracie Barra Centro"
              value={formData.nome}
              onChange={handleChange}
              required
              disabled={saving}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="documento">CNPJ ou CPF (opcional)</label>
            <input
              id="documento"
              name="documento"
              type="text"
              placeholder="00.000.000/0001-00"
              value={formData.documento}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </section>

        {/* Canais de Contato */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Phone size={18} className={styles.sectionIcon} />
            <h2>Contatos & Comunicação</h2>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="whatsapp">
                WhatsApp de Cobrança <span className={styles.required}>*</span>
              </label>
              <input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                placeholder="(11) 98765-4321"
                value={formData.whatsapp}
                onChange={handleChange}
                disabled={saving}
              />
              <span className={styles.inputHint}>Usado para envio de lembretes aos alunos</span>
            </div>

            <div className={styles.field}>
              <label htmlFor="telefone">Telefone Fixo / Comercial</label>
              <input
                id="telefone"
                name="telefone"
                type="tel"
                placeholder="(11) 3456-7890"
                value={formData.telefone}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="email">E-mail Institucional</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="contato@suaacademia.com.br"
              value={formData.email}
              onChange={handleChange}
              disabled={saving}
            />
          </div>
        </section>

        {/* Chave PIX & Recebimentos */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <QrCode size={18} className={styles.sectionIcon} />
            <h2>Chave PIX da Academia</h2>
          </div>

          <p className={styles.sectionDescription}>
            Cadastre a chave PIX da sua academia. Os alunos poderão visualizar e copiar a chave com 1 toque no 
            Portal do Aluno para efetuar o pagamento das mensalidades.
          </p>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="tipo_chave_pix">Tipo de Chave PIX</label>
              <select
                id="tipo_chave_pix"
                name="tipo_chave_pix"
                value={formData.tipo_chave_pix || 'aleatoria'}
                onChange={handleChange}
                disabled={saving}
                className={styles.selectInput}
              >
                <option value="aleatoria">Chave Aleatória (EVP)</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="email">E-mail</option>
                <option value="telefone">Celular / Telefone</option>
              </select>
            </div>

            <div className={styles.field}>
              <div className={styles.labelWithAction}>
                <label htmlFor="chave_pix">Chave PIX</label>
                {quickFill && (
                  <button
                    type="button"
                    className={styles.quickFillBtn}
                    onClick={handleQuickFillPix}
                    title={`Preencher com ${quickFill.label}`}
                  >
                    Usar {quickFill.label}
                  </button>
                )}
              </div>
              <input
                id="chave_pix"
                name="chave_pix"
                type="text"
                placeholder={getPixPlaceholder(formData.tipo_chave_pix)}
                value={formData.chave_pix}
                onChange={handleChange}
                disabled={saving}
              />
              <span className={styles.inputHint}>
                Chave oficial exibida nas faturas dos alunos
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="beneficiario_pix">Nome do Titular / Beneficiário da Conta (Opcional)</label>
            <input
              id="beneficiario_pix"
              name="beneficiario_pix"
              type="text"
              placeholder="Ex: Gracie Barra Centro LTDA ou Mestre Carlos"
              value={formData.beneficiario_pix}
              onChange={handleChange}
              disabled={saving}
            />
            <span className={styles.inputHint}>
              Facilita para o aluno conferir o nome do destinatário ao confirmar o pagamento no banco
            </span>
          </div>

          {/* Prévia: Visão do Aluno */}
          {formData.chave_pix && formData.chave_pix.trim().length > 0 && (
            <div className={styles.pixPreviewBox}>
              <div className={styles.pixPreviewHeader}>
                <span className={styles.pixPreviewBadge}>Prévia: Visão do Aluno no Portal</span>
              </div>
              <div className={styles.pixPreviewCard}>
                <div className={styles.pixPreviewTop}>
                  <span className={styles.pixPreviewLabel}>Chave PIX da Academia</span>
                  {formData.beneficiario_pix?.trim() && (
                    <span className={styles.pixPreviewTitular}>
                      Beneficiário: <strong>{formData.beneficiario_pix.trim()}</strong>
                    </span>
                  )}
                </div>
                <div className={styles.pixPreviewKeyRow}>
                  <span className={styles.pixPreviewKey}>{formData.chave_pix.trim()}</span>
                  <span className={styles.pixPreviewCopyMock}>
                    <Copy size={13} />
                    <span>Copiar PIX</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Personalização das Mensagens de Cobrança (WhatsApp) */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <MessageSquare size={18} className={styles.sectionIcon} />
            <h2>Mensagens de Cobrança (WhatsApp)</h2>
          </div>

          <p className={styles.sectionDescription}>
            Personalize os textos automáticos enviados aos alunos ao clicar em "Cobrar no WhatsApp". 
            Utilize as tags dinâmicas para preencher automaticamente com o nome, valor, vencimento e chave PIX da academia.
          </p>

          {/* Abas de Alternância dos Modelos */}
          <div className={styles.msgTabsContainer}>
            <button
              type="button"
              className={`${styles.msgTabButton} ${activeMsgTab === 'pendente' ? styles.msgTabActive : ''}`}
              onClick={() => setActiveMsgTab('pendente')}
            >
              <span>🟡 Lembrete Preventivo (A Vencer)</span>
            </button>
            <button
              type="button"
              className={`${styles.msgTabButton} ${activeMsgTab === 'atrasada' ? styles.msgTabActiveAtrasada : ''}`}
              onClick={() => setActiveMsgTab('atrasada')}
            >
              <span>🔴 Cobrança de Atraso (Vencida)</span>
            </button>
          </div>

          {/* Editor do Modelo Selecionado */}
          {activeMsgTab === 'pendente' ? (
            <div className={styles.templateEditorBox}>
              <div className={styles.templateEditorHeader}>
                <div className={styles.templateTitleGroup}>
                  <strong>Mensagem para faturas a vencer ou no vencimento</strong>
                  <span className={styles.inputHint}>Ideal para envio preventivo e amigável</span>
                </div>
                <button
                  type="button"
                  className={styles.restoreBtn}
                  onClick={() => handleRestoreTemplate('msg_cobranca_pendente')}
                  title="Restaurar texto padrão sugerido"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar Padrão</span>
                </button>
              </div>

              {/* Tags clicáveis */}
              <div className={styles.tagsContainer}>
                <span className={styles.tagsLabel}>Clique em uma tag para inserir no texto:</span>
                <div className={styles.tagsList}>
                  {AVAILABLE_TAGS.map(({ tag, desc }) => (
                    <button
                      key={tag}
                      type="button"
                      className={styles.tagPill}
                      onClick={() => handleInsertTag('msg_cobranca_pendente', tag)}
                      title={desc}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="msg_cobranca_pendente"
                name="msg_cobranca_pendente"
                rows={6}
                className={styles.messageTextarea}
                value={formData.msg_cobranca_pendente}
                onChange={handleChange}
                placeholder={DEFAULT_BILLING_TEMPLATES.pendente}
                disabled={saving}
              />
            </div>
          ) : (
            <div className={styles.templateEditorBox}>
              <div className={styles.templateEditorHeader}>
                <div className={styles.templateTitleGroup}>
                  <strong>Mensagem para faturas já atrasadas</strong>
                  <span className={styles.inputHint}>Aviso educado para faturas com prazo estourado</span>
                </div>
                <button
                  type="button"
                  className={styles.restoreBtn}
                  onClick={() => handleRestoreTemplate('msg_cobranca_atrasada')}
                  title="Restaurar texto padrão sugerido"
                >
                  <RotateCcw size={13} />
                  <span>Restaurar Padrão</span>
                </button>
              </div>

              {/* Tags clicáveis */}
              <div className={styles.tagsContainer}>
                <span className={styles.tagsLabel}>Clique em uma tag para inserir no texto:</span>
                <div className={styles.tagsList}>
                  {AVAILABLE_TAGS.map(({ tag, desc }) => (
                    <button
                      key={tag}
                      type="button"
                      className={styles.tagPill}
                      onClick={() => handleInsertTag('msg_cobranca_atrasada', tag)}
                      title={desc}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                id="msg_cobranca_atrasada"
                name="msg_cobranca_atrasada"
                rows={6}
                className={styles.messageTextarea}
                value={formData.msg_cobranca_atrasada}
                onChange={handleChange}
                placeholder={DEFAULT_BILLING_TEMPLATES.atrasada}
                disabled={saving}
              />
            </div>
          )}

          {/* Prévia ao vivo da mensagem (estilo balão do WhatsApp) */}
          <div className={styles.whatsappPreviewContainer}>
            <div className={styles.whatsappPreviewHeader}>
              <div className={styles.whatsappBrand}>
                <Sparkles size={14} color="#34D399" />
                <span>Simulação da mensagem no WhatsApp do Aluno:</span>
              </div>
              <span className={styles.whatsappPreviewBadge}>Exemplo com dados simulados</span>
            </div>

            <div className={styles.whatsappBalloonWrapper}>
              <div className={styles.whatsappBalloon}>
                <p className={styles.whatsappBalloonText}>
                  {renderPreviewMessage(activeMsgTab)}
                </p>
                <div className={styles.whatsappBalloonTime}>
                  <span>10:30</span>
                  <Check size={14} color="#34D399" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Localização & Endereço */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <MapPin size={18} className={styles.sectionIcon} />
            <h2>Localização do Tatame</h2>
          </div>

          <div className={styles.gridAddressMain}>
            <div className={styles.field}>
              <label htmlFor="logradouro">Logradouro / Rua</label>
              <input
                id="logradouro"
                name="logradouro"
                type="text"
                placeholder="Rua, avenida ou alameda"
                value={formData.logradouro}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="numero">Número</label>
              <input
                id="numero"
                name="numero"
                type="text"
                placeholder="100"
                value={formData.numero}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className={styles.gridTwo}>
            <div className={styles.field}>
              <label htmlFor="complemento">Complemento</label>
              <input
                id="complemento"
                name="complemento"
                type="text"
                placeholder="Sala 2, Galpão A"
                value={formData.complemento}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="bairro">Bairro</label>
              <input
                id="bairro"
                name="bairro"
                type="text"
                placeholder="Centro"
                value={formData.bairro}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>

          <div className={styles.gridCityState}>
            <div className={styles.field}>
              <label htmlFor="cidade">Cidade</label>
              <input
                id="cidade"
                name="cidade"
                type="text"
                placeholder="São Paulo"
                value={formData.cidade}
                onChange={handleChange}
                disabled={saving}
              />
            </div>

            <div className={styles.fieldSmall}>
              <label htmlFor="estado">UF</label>
              <input
                id="estado"
                name="estado"
                type="text"
                maxLength={2}
                placeholder="SP"
                value={formData.estado}
                onChange={handleChange}
                disabled={saving}
                style={{ textTransform: 'uppercase' }}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="cep">CEP</label>
              <input
                id="cep"
                name="cep"
                type="text"
                placeholder="00000-000"
                value={formData.cep}
                onChange={handleChange}
                disabled={saving}
              />
            </div>
          </div>
        </section>

        {/* Botão de Salvar Flutuante / Bottom */}
        <div className={styles.submitBar}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className={styles.spinner} size={20} />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save size={20} />
                <span>Salvar Informações</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Zona de Perigo: Exclusão em Cascata da Conta e Dados */}
      <section className={styles.dangerSection}>
        <div className={styles.dangerSectionHeader}>
          <AlertTriangle size={20} />
          <h2 className={styles.dangerSectionTitle}>Zona de Perigo</h2>
        </div>

        <div className={styles.dangerCard}>
          <div className={styles.dangerInfo}>
            <h3 className={styles.dangerTitle}>Excluir Conta e Academia</h3>
            <p className={styles.dangerDescription}>
              Esta ação excluirá permanentemente sua conta, a academia e todos os dados vinculados em cascata
              (alunos, modalidades, graduações, mensalidades e pagamentos). Esta operação não pode ser desfeita.
            </p>
          </div>
          <button
            type="button"
            className={styles.dangerButton}
            onClick={() => {
              setDeletePassword('');
              setDeleteConfirmText('');
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 size={16} />
            <span>Excluir Conta e Todos os Dados</span>
          </button>
        </div>
      </section>

      {/* Modal de Confirmação com Senha e Cascata */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconBox}>
                  <AlertTriangle size={22} />
                </div>
                <h3 className={styles.modalTitle}>Excluir Conta Definitivamente?</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !deletingAccount && setIsDeleteModalOpen(false)}
                disabled={deletingAccount}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleDeleteAccount}>
              <div className={styles.modalBody}>
                {deleteError && (
                  <Alert type="error" message={deleteError} onClose={() => setDeleteError(null)} />
                )}

                <div className={styles.cascadeWarningList}>
                  <p>Aviso: Esta ação é definitiva e apagará em cascata:</p>
                  <ul>
                    <li>Sua conta de usuário e acesso ao sistema</li>
                    <li>Todos os alunos e matrículas</li>
                    <li>Todas as modalidades e histórico de graduações</li>
                    <li>Todas as faturas, mensalidades e pagamentos</li>
                    <li>O logotipo e dados da sua academia</li>
                  </ul>
                </div>

                <div className={styles.confirmationInputGroup}>
                  <label htmlFor="deletePassword">
                    <Lock size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
                    Confirme sua senha de acesso:
                  </label>
                  <input
                    id="deletePassword"
                    type="password"
                    placeholder="Sua senha de login"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    disabled={deletingAccount}
                    required
                  />
                </div>

                <div className={styles.confirmationInputGroup}>
                  <label htmlFor="deleteConfirmText">
                    Digite a palavra <strong>EXCLUIR</strong> para autorizar:
                  </label>
                  <input
                    id="deleteConfirmText"
                    type="text"
                    placeholder="EXCLUIR"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    disabled={deletingAccount}
                    required
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={deletingAccount}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.confirmDeleteBtn}
                  disabled={deletingAccount || !deletePassword || deleteConfirmText.trim().toUpperCase() !== 'EXCLUIR'}
                >
                  {deletingAccount ? (
                    <>
                      <Loader2 className={styles.spinner} size={18} />
                      <span>Excluindo tudo...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>Confirmar e Excluir Definitivamente</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
