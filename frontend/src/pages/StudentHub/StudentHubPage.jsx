import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Receipt, Loader2, Sparkles } from 'lucide-react';
import { useStudentAuth } from '../../hooks/useStudentAuth';
import { studentPortalService } from '../../services/studentPortalService';
import { StudentBeltCard } from '../../components/studentPortal/StudentBeltCard/StudentBeltCard';
import { StudentInvoiceCard } from '../../components/studentPortal/StudentInvoiceCard/StudentInvoiceCard';
import { StudentAlertBanner } from '../../components/studentPortal/StudentAlertBanner/StudentAlertBanner';
import { StudentNotificationPopup } from '../../components/studentPortal/StudentNotificationPopup/StudentNotificationPopup';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './StudentHubPage.module.css';

export function StudentHubPage() {
  const navigate = useNavigate();
  const { student, academia, logout } = useStudentAuth();

  const [hubData, setHubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtros de faturas
  const [invoiceFilter, setInvoiceFilter] = useState('todas'); // 'todas', 'pendentes', 'pagas'

  // Controle de popup de notificação
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const invoicesRef = useRef(null);

  const fetchHubData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentPortalService.getHub();
      setHubData(data);

      // Verifica se deve abrir o popup de notificação (apenas na 1ª vez por sessão)
      const dismissed = sessionStorage.getItem('tatamyhub_aluno_popup_dismissed');
      if (!dismissed && data.alerta?.deve_exibir_popup) {
        setIsPopupOpen(true);
      }
    } catch (err) {
      setError(err.message || 'Falha ao carregar dados do Hub.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHubData();
  }, [fetchHubData]);

  const handleLogout = () => {
    logout();
    navigate('/aluno/login', { replace: true });
  };

  const handleScrollToInvoices = () => {
    if (invoicesRef.current) {
      invoicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading && !hubData) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingWrapper}>
          <Loader2 size={40} className={styles.spinner} />
          <p>Carregando seu Hub Marcial...</p>
        </div>
      </div>
    );
  }

  const faturas = hubData?.faturas_recentes || [];
  const faturasFiltradas = faturas.filter(inv => {
    if (invoiceFilter === 'pendentes') return ['pendente', 'atrasada'].includes(inv.status);
    if (invoiceFilter === 'pagas') return inv.status === 'paga';
    return true;
  });

  return (
    <div className={styles.page}>
      {/* Barra de Navegação Superior do Aluno */}
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          {hubData?.academia?.logo_url ? (
            <img
              src={hubData.academia.logo_url}
              alt={hubData.academia.nome}
              className={styles.academyLogo}
            />
          ) : (
            <div className={styles.academyFallbackLogo}>
              {hubData?.academia?.nome?.[0] || 'T'}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <h1 className={styles.academyName}>{hubData?.academia?.nome || academia?.nome || 'Minha Academia'}</h1>
            <span className={styles.portalBadge}>Área do Aluno</span>
          </div>
        </div>

        <div className={styles.userNav}>
          <span className={styles.studentGreeting}>
            Olá, <strong>{hubData?.aluno?.nome?.split(' ')?.[0] || student?.nome?.split(' ')?.[0]}</strong>
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Sair do Portal"
          >
            <LogOut size={15} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className={styles.mainContent}>
        {error && (
          <Alert type="error" message={error} onClose={() => setError(null)} />
        )}

        {/* 1. Banner de Alerta Dinâmico */}
        {hubData?.alerta && (
          <StudentAlertBanner
            alert={hubData.alerta}
            onActionClick={handleScrollToInvoices}
          />
        )}

        {/* 2. Card de Graduação Marcial */}
        <StudentBeltCard
          currentGraduation={hubData?.graduacao_atual}
          history={hubData?.historico_graduacoes || []}
        />

        {/* 3. Seção de Mensalidades */}
        <section ref={invoicesRef} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleRow}>
              <Receipt size={20} color="#3B82F6" />
              <h2 className={styles.sectionTitle}>Mensalidades & Faturas</h2>
            </div>

            <div className={styles.filterTabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${invoiceFilter === 'todas' ? styles.tabBtnActive : ''}`}
                onClick={() => setInvoiceFilter('todas')}
              >
                Todas
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${invoiceFilter === 'pendentes' ? styles.tabBtnActive : ''}`}
                onClick={() => setInvoiceFilter('pendentes')}
              >
                Pendentes
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${invoiceFilter === 'pagas' ? styles.tabBtnActive : ''}`}
                onClick={() => setInvoiceFilter('pagas')}
              >
                Pagas
              </button>
            </div>
          </div>

          {faturasFiltradas.length > 0 ? (
            <div className={styles.invoicesGrid}>
              {faturasFiltradas.map(invoice => (
                <StudentInvoiceCard
                  key={invoice.id}
                  invoice={invoice}
                  chavePixDefault={hubData?.academia?.chave_pix}
                  whatsappAcademia={hubData?.academia?.whatsapp}
                  beneficiarioPix={hubData?.academia?.beneficiario_pix}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyInvoices}>
              <Sparkles size={28} />
              <p style={{ margin: 0, fontWeight: 500 }}>
                {invoiceFilter === 'pendentes'
                  ? 'Nenhuma mensalidade pendente. Parabéns, você está em dia!'
                  : 'Nenhuma fatura encontrada neste filtro.'}
              </p>
            </div>
          )}
        </section>
      </main>

      {/* 4. Modal Popup de Notificação Inteligente (Primeiro Acesso na Sessão) */}
      {isPopupOpen && hubData?.alerta && (
        <StudentNotificationPopup
          alert={hubData.alerta}
          chavePix={hubData?.academia?.chave_pix}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
}
