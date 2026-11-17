import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Calendar,
  Award,
  AlertCircle,
  MessageSquare,
  Edit2,
  Power,
  Loader2,
  Clock,
  Shield,
  Repeat,
  DollarSign,
  Receipt,
  Plus,
  Trash2,
  X,
  KeyRound
} from 'lucide-react';
import { studentService } from '../../services/studentService';
import { modalityService } from '../../services/modalityService';
import { financialService } from '../../services/financialService';
import { studentPortalService } from '../../services/studentPortalService';
import { BeltBadge } from '../../components/students/BeltBadge/BeltBadge';
import { StudentModal } from '../../components/students/StudentModal/StudentModal';
import { GraduationModal } from '../../components/students/GraduationModal/GraduationModal';
import { InvoiceCard } from '../../components/financial/InvoiceCard/InvoiceCard';
import { PaymentModal } from '../../components/financial/PaymentModal/PaymentModal';
import { CreateInvoiceModal } from '../../components/financial/CreateInvoiceModal/CreateInvoiceModal';
import { BillingMessageModal } from '../../components/financial/BillingMessageModal/BillingMessageModal';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './StudentDetailPage.module.css';

export function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [modalities, setModalities] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Modais
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isGraduationModalOpen, setIsGraduationModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState(null);
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Modal de Credenciais do Portal do Aluno
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [portalPassword, setPortalPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const fetchStudent = useCallback(async () => {
    setLoading(true);
    try {
      const [studentData, modalitiesData, invoicesData] = await Promise.all([
        studentService.getStudentById(id),
        modalityService.listModalities('ativa'),
        financialService.listInvoices({ aluno_id: id })
      ]);
      setStudent(studentData);
      setModalities(modalitiesData);
      setInvoices(invoicesData || []);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar dados do aluno.' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudent();
  }, [fetchStudent]);

  const handleUpdateStudent = async (updatedData) => {
    await studentService.updateStudent(id, updatedData);
    setFeedback({ type: 'success', message: 'Dados cadastrais atualizados com sucesso!' });
    fetchStudent();
  };

  const handleWhatsAppBilling = (inv) => {
    setSelectedInvoiceForWhatsApp(inv);
  };

  const handlePaymentSuccess = () => {
    setFeedback({ type: 'success', message: 'Pagamento registrado com sucesso!' });
    fetchStudent();
  };

  const handleCreateInvoiceSuccess = () => {
    setFeedback({ type: 'success', message: 'Fatura emitida com sucesso!' });
    fetchStudent();
  };

  const handleToggleStatus = async () => {
    if (!student) return;
    const newStatus = student.status === 'ativo' ? 'inativo' : 'ativo';
    try {
      await studentService.setStudentStatus(id, newStatus);
      setFeedback({
        type: 'info',
        message: `Aluno agora está marcado como ${newStatus === 'ativo' ? 'Ativo' : 'Inativo'}.`
      });
      fetchStudent();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao alterar status do aluno.' });
    }
  };

  const handleAddGraduation = async (graduationData) => {
    await studentService.addGraduation(id, graduationData);
    setFeedback({ type: 'success', message: 'Graduação registrada com sucesso!' });
    fetchStudent();
  };

  const handleDeleteStudent = async () => {
    try {
      setDeletingStudent(true);
      setDeleteError(null);
      await studentService.deleteStudent(id);
      setIsDeleteModalOpen(false);
      navigate('/alunos', { replace: true });
    } catch (err) {
      setDeleteError(err.message || 'Erro ao excluir aluno.');
      setDeletingStudent(false);
    }
  };

  const handleSavePortalPassword = async (e) => {
    e.preventDefault();
    if (!portalPassword || portalPassword.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    try {
      setSavingPassword(true);
      setPasswordError(null);
      await studentPortalService.setStudentCredentials(id, { nova_senha: portalPassword });
      setIsPasswordModalOpen(false);
      setPortalPassword('');
      setFeedback({ type: 'success', message: 'Senha do Portal do Aluno configurada com sucesso!' });
    } catch (err) {
      setPasswordError(err.message || 'Erro ao definir senha do aluno.');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 size={36} className={styles.spinner} />
        <p>Carregando prontuário marcial do aluno...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className={styles.errorState}>
        <p>Aluno não encontrado.</p>
        <button type="button" onClick={() => navigate('/alunos')} className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>Voltar para Alunos</span>
        </button>
      </div>
    );
  }

  const isInactive = student.status === 'inativo';
  const cleanPhone = student.telefone ? student.telefone.replace(/\D/g, '') : null;
  const whatsappUrl = cleanPhone ? `https://wa.me/55${cleanPhone.replace(/^55/, '')}` : null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Não informada';
    const cleanDate = dateStr.split('T')[0];
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatPhone = (digits) => {
    if (!digits) return 'Não informado';
    const d = digits.replace(/^55/, '');
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return d;
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'AL';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={styles.page}>
      {/* Navegação Voltar */}
      <div className={styles.navHeader}>
        <button type="button" onClick={() => navigate('/alunos')} className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>Voltar para Lista de Alunos</span>
        </button>
      </div>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Hero Card do Aluno */}
      <section className={`${styles.profileHero} ${isInactive ? styles.heroInactive : ''}`}>
        <div className={styles.heroMain}>
          <div className={styles.avatar}>
            {getInitials(student.nome)}
          </div>

          <div className={styles.heroDetails}>
            <div className={styles.heroNameRow}>
              <h1 className={styles.studentName}>{student.nome}</h1>
              <span
                className={`${styles.statusBadge} ${isInactive ? styles.statusBadgeInactive : styles.statusBadgeActive}`}
              >
                {isInactive ? 'Inativo' : 'Ativo'}
              </span>
            </div>

            <p className={styles.matriculaInfo}>
              Matrícula em {formatDate(student.data_matricula)}
            </p>
          </div>
        </div>

        {/* Barra de Ações Rápidas */}
        <div className={styles.heroActions}>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              title="Abrir WhatsApp"
            >
              <MessageSquare size={18} />
              <span>WhatsApp</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => setIsGraduationModalOpen(true)}
            className={styles.graduateBtn}
          >
            <Award size={18} />
            <span>Graduar Aluno</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className={styles.editBtn}
            title="Editar informações cadastrais"
          >
            <Edit2 size={16} />
            <span>Editar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalPassword('');
              setPasswordError(null);
              setIsPasswordModalOpen(true);
            }}
            className={styles.editBtn}
            title="Definir ou alterar senha de acesso ao portal do aluno"
          >
            <KeyRound size={16} />
            <span>Senha do Portal</span>
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={`${styles.toggleStatusBtn} ${isInactive ? styles.activateBtn : styles.deactivateBtn}`}
            title={isInactive ? 'Reativar Aluno' : 'Inativar Aluno'}
          >
            <Power size={16} />
            <span>{isInactive ? 'Reativar' : 'Inativar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setIsDeleteModalOpen(true);
            }}
            className={`${styles.toggleStatusBtn} ${styles.deleteBtn}`}
            title="Excluir Aluno e Dados Vinculados"
          >
            <Trash2 size={16} />
            <span>Excluir</span>
          </button>
        </div>
      </section>

      {/* Alerta de Restrições Médicas */}
      {student.observacoes_medicas && (
        <div className={styles.medicalAlertCard}>
          <div className={styles.medicalIconCircle}>
            <AlertCircle size={20} className={styles.medicalIcon} />
          </div>
          <div className={styles.medicalContent}>
            <h4 className={styles.medicalTitle}>Observações Médicas & Restrições Físicas</h4>
            <p className={styles.medicalText}>{student.observacoes_medicas}</p>
          </div>
        </div>
      )}

      {/* Grid de Seções */}
      <div className={styles.sectionsGrid}>
        {/* Coluna 1: Dados e Modalidades */}
        <div className={styles.leftCol}>
          {/* Card Dados Cadastrais */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <User size={18} className={styles.cardTitleIcon} />
              <span>Dados Pessoais</span>
            </h3>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Telefone / WhatsApp</span>
                <span className={styles.detailValue}>{formatPhone(student.telefone)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Data de Nascimento</span>
                <span className={styles.detailValue}>{formatDate(student.data_nascimento)}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Início no Tatame</span>
                <span className={styles.detailValue}>{formatDate(student.data_matricula)}</span>
              </div>
            </div>
          </div>

          {/* Card Cobrança Contínua & Plano Mensal */}
          <div className={styles.card}>
            <div className={styles.cardHeaderWithAction}>
              <h3 className={styles.cardTitle}>
                <Repeat size={18} className={styles.cardTitleIcon} />
                <span>Cobrança Contínua & Mensalidade</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className={styles.miniActionBtn}
                title="Configurar Plano"
              >
                Configurar
              </button>
            </div>

            <div className={styles.detailsList}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Status da Recorrência</span>
                <span className={`${styles.detailValue} ${student.cobranca_continua ? styles.activeStatusText : styles.inactiveStatusText}`}>
                  {student.cobranca_continua ? 'Ativa (Cobrança todo mês)' : 'Desativada'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Valor Definido</span>
                <span className={styles.detailValue}>
                  {student.valor_mensalidade && student.valor_mensalidade > 0
                    ? Number(student.valor_mensalidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'Padrão da academia'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Dia de Vencimento</span>
                <span className={styles.detailValue}>
                  Todo dia {student.dia_vencimento || 10}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Vigência / Validade</span>
                <span className={styles.detailValue}>
                  {student.validade_plano
                    ? `Válido até ${formatDate(student.validade_plano)}`
                    : 'Contínua por tempo indeterminado'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Modalidades e Graduação Atual */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              <Shield size={18} className={styles.cardTitleIcon} />
              <span>Modalidades & Faixa Atual</span>
            </h3>

            {student.modalidades?.length > 0 ? (
              <div className={styles.modalitiesList}>
                {student.modalidades.map((mod) => (
                  <div key={mod.id || mod.modalidade_id} className={styles.modalityItem}>
                    <div className={styles.modalityMeta}>
                      <span className={styles.modalityName}>
                        {mod.modalidade_nome || modalities.find(m => m.id === mod.modalidade_id)?.nome || 'Modalidade'}
                      </span>
                      <span className={styles.modalityStart}>Desde {formatDate(mod.data_inicio)}</span>
                    </div>
                    <BeltBadge faixa={mod.faixa_atual} graus={mod.graus_atual} size="md" />
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyCardText}>Nenhuma modalidade vinculada.</p>
            )}
          </div>
        </div>

        {/* Coluna 2: Linha do Tempo de Graduações */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardHeaderWithAction}>
              <h3 className={styles.cardTitle}>
                <Award size={18} className={styles.cardTitleIcon} />
                <span>Histórico de Graduações</span>
              </h3>

              <button
                type="button"
                onClick={() => setIsGraduationModalOpen(true)}
                className={styles.smallActionBtn}
              >
                + Nova Promoção
              </button>
            </div>

            {student.historico_graduacoes?.length > 0 ? (
              <div className={styles.timeline}>
                {student.historico_graduacoes.map((item, index) => (
                  <div key={item.id || index} className={styles.timelineItem}>
                    <div className={styles.timelineMarker}>
                      <div className={styles.timelineDot} />
                      {index < student.historico_graduacoes.length - 1 && (
                        <div className={styles.timelineLine} />
                      )}
                    </div>

                    <div className={styles.timelineContent}>
                      <div className={styles.timelineHeader}>
                        <div className={styles.timelineBeltRow}>
                          <BeltBadge faixa={item.faixa} graus={item.graus} size="sm" />
                          <span className={styles.timelineModality}>
                            {item.modalidade_nome || modalities.find(m => m.id === item.modalidade_id)?.nome || 'Modalidade'}
                          </span>
                        </div>
                        <span className={styles.timelineDate}>
                          {formatDate(item.data_graduacao)}
                        </span>
                      </div>

                      {item.observacao && (
                        <p className={styles.timelineObs}>{item.observacao}</p>
                      )}

                      {item.promovido_por_nome && (
                        <span className={styles.timelineAuthor}>
                          Promovido por: {item.promovido_por_nome}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyCardText}>
                Nenhum registro de graduação cadastrado ainda.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Seção Mensalidades & Cobranças do Aluno */}
      <section className={styles.invoicesSection}>
        <div className={styles.card}>
          <div className={styles.cardHeaderWithAction}>
            <h3 className={styles.cardTitle}>
              <Receipt size={18} className={styles.cardTitleIcon} />
              <span>Mensalidades & Cobranças ({invoices.length})</span>
            </h3>

            <button
              type="button"
              onClick={() => setIsCreateInvoiceModalOpen(true)}
              className={styles.smallActionBtn}
            >
              + Nova Fatura
            </button>
          </div>

          {invoices.length > 0 ? (
            <div className={styles.invoicesList}>
              {invoices.map((inv) => (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  onPay={(item) => setSelectedInvoiceForPayment(item)}
                  onWhatsAppBilling={handleWhatsAppBilling}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyInvoicesBox}>
              <Receipt size={32} className={styles.emptyIcon} />
              <p className={styles.emptyCardText}>
                Nenhuma cobrança emitida para este aluno ainda.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(true)}
                className={styles.miniActionBtn}
              >
                Emitir Fatura
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal Editar Aluno */}
      <StudentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateStudent}
        initialData={student}
        modalities={modalities}
      />

      {/* Modal Graduar Aluno */}
      <GraduationModal
        isOpen={isGraduationModalOpen}
        onClose={() => setIsGraduationModalOpen(false)}
        onSave={handleAddGraduation}
        studentName={student.nome}
        modalities={student.modalidades?.length > 0 ? student.modalidades : modalities}
      />

      {/* Modal Baixar Pagamento */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Modal Emitir Fatura Avulsa */}
      {isCreateInvoiceModalOpen && (
        <CreateInvoiceModal
          isOpen={isCreateInvoiceModalOpen}
          onClose={() => setIsCreateInvoiceModalOpen(false)}
          onSuccess={handleCreateInvoiceSuccess}
        />
      )}

      {/* Modal Excluir Aluno (Cascata) */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconBox}>
                  <Trash2 size={20} />
                </div>
                <h3 className={styles.modalTitle}>Excluir Aluno?</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !deletingStudent && setIsDeleteModalOpen(false)}
                disabled={deletingStudent}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              {deleteError && (
                <Alert type="error" message={deleteError} onClose={() => setDeleteError(null)} />
              )}

              <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Tem certeza que deseja excluir o cadastro de <strong>{student.nome}</strong>?
              </p>

              <div className={styles.cascadeWarningList}>
                <p>Esta ação é definitiva e removerá em cascata:</p>
                <ul>
                  <li>Todas as modalidades e graduações do aluno</li>
                  <li>Todas as faturas e mensalidades geradas</li>
                  <li>Todos os registros de pagamentos associados</li>
                </ul>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deletingStudent}
              >
                Cancelar
              </button>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={handleDeleteStudent}
                disabled={deletingStudent}
              >
                {deletingStudent ? (
                  <>
                    <Loader2 size={16} className={styles.spinner} />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>Confirmar Exclusão</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Definir Senha do Portal do Aluno */}
      {isPasswordModalOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderLeft}>
                <div className={styles.modalIconBox} style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>
                  <KeyRound size={20} />
                </div>
                <h3 className={styles.modalTitle}>Acesso ao Portal do Aluno</h3>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => !savingPassword && setIsPasswordModalOpen(false)}
                disabled={savingPassword}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePortalPassword}>
              <div className={styles.modalBody}>
                {passwordError && (
                  <Alert type="error" message={passwordError} onClose={() => setPasswordError(null)} />
                )}

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Defina a senha de acesso para <strong>{student.nome}</strong>. O aluno usará o telefone{' '}
                  <strong>{student.telefone || 'Não informado'}</strong> para entrar em <code>/aluno/login</code>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label htmlFor="portalPasswordInput" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Nova Senha de Acesso (mínimo 6 caracteres):
                  </label>
                  <input
                    id="portalPasswordInput"
                    type="password"
                    placeholder="Ex: Tatamy2026"
                    value={portalPassword}
                    onChange={(e) => setPortalPassword(e.target.value)}
                    disabled={savingPassword}
                    required
                    minLength={6}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid var(--border-subtle, #CBD5E1)',
                      fontSize: '0.9375rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setIsPasswordModalOpen(false)}
                  disabled={savingPassword}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.confirmDeleteBtn}
                  style={{ backgroundColor: '#2563EB', borderColor: '#1D4ED8' }}
                  disabled={savingPassword || !portalPassword || portalPassword.length < 6}
                >
                  {savingPassword ? (
                    <>
                      <Loader2 size={16} className={styles.spinner} />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} />
                      <span>Salvar Senha</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedInvoiceForWhatsApp && (
        <BillingMessageModal
          isOpen={!!selectedInvoiceForWhatsApp}
          onClose={() => setSelectedInvoiceForWhatsApp(null)}
          invoice={selectedInvoiceForWhatsApp}
        />
      )}
    </div>
  );
}
