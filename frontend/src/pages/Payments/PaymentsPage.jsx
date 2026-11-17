import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  DollarSign, 
  Search, 
  Plus, 
  Layers, 
  Filter, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  FileText,
  Calendar,
  X
} from 'lucide-react';
import { financialService } from '../../services/financialService';
import { InvoiceCard } from '../../components/financial/InvoiceCard/InvoiceCard';
import { PaymentModal } from '../../components/financial/PaymentModal/PaymentModal';
import { CreateInvoiceModal } from '../../components/financial/CreateInvoiceModal/CreateInvoiceModal';
import { BatchGenerateModal } from '../../components/financial/BatchGenerateModal/BatchGenerateModal';
import { BillingMessageModal } from '../../components/financial/BillingMessageModal/BillingMessageModal';
import { Alert } from '../../components/common/Alert/Alert';
import styles from './PaymentsPage.module.css';

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'todas';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Filtros
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [competenciaFilter, setCompetenciaFilter] = useState('todas');

  // Modais
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [selectedInvoiceForWhatsApp, setSelectedInvoiceForWhatsApp] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  // Sincroniza query param com statusFilter
  useEffect(() => {
    const qStatus = searchParams.get('status');
    if (qStatus && ['todas', 'atrasada', 'pendente', 'paga'].includes(qStatus)) {
      setStatusFilter(qStatus);
    }
  }, [searchParams]);

  const loadInvoices = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // Carrega todas as faturas para permitir métricas globais e filtragem instantânea
      const data = await financialService.listInvoices();
      setInvoices(data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar mensalidades.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Lista única de competências presentes nas faturas para o filtro
  const competenciasDisponiveis = useMemo(() => {
    const comps = new Set();
    invoices.forEach(inv => {
      if (inv.competencia) comps.add(inv.competencia);
    });
    return Array.from(comps).sort().reverse();
  }, [invoices]);

  // Métricas de resumo (KPIs do topo)
  const summaryMetrics = useMemo(() => {
    let totalAberto = 0;
    let totalAtrasado = 0;
    let totalRecebido = 0;
    let qtdAtrasadas = 0;
    let qtdPendentes = 0;
    let qtdPagas = 0;

    invoices.forEach(inv => {
      const valor = Number(inv.valor) || 0;
      const valorPago = Number(inv.valor_pago) || 0;
      const saldo = Number(inv.saldo_devedor !== undefined ? inv.saldo_devedor : (valor - valorPago)) || 0;

      if (inv.status !== 'cancelada') {
        totalRecebido += valorPago;
        if (inv.status === 'atrasada') {
          totalAtrasado += saldo;
          totalAberto += saldo;
          qtdAtrasadas += 1;
        } else if (inv.status === 'pendente') {
          totalAberto += saldo;
          qtdPendentes += 1;
        } else if (inv.status === 'paga') {
          qtdPagas += 1;
        }
      }
    });

    return {
      totalAberto,
      totalAtrasado,
      totalRecebido,
      qtdAtrasadas,
      qtdPendentes,
      qtdPagas,
      totalGeral: invoices.filter(i => i.status !== 'cancelada').length
    };
  }, [invoices]);

  // Filtragem em memória
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Filtro de Status
      if (statusFilter !== 'todas') {
        if (inv.status !== statusFilter) return false;
      }

      // Filtro de Competência
      if (competenciaFilter !== 'todas') {
        if (inv.competencia !== competenciaFilter) return false;
      }

      // Busca por Aluno ou Telefone
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesName = inv.aluno_nome && inv.aluno_nome.toLowerCase().includes(term);
        const matchesPhone = inv.aluno_telefone && inv.aluno_telefone.includes(term);
        if (!matchesName && !matchesPhone) return false;
      }

      return true;
    });
  }, [invoices, statusFilter, competenciaFilter, searchTerm]);

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setSearchParams(status === 'todas' ? {} : { status });
  };

  const handleWhatsAppBilling = (invoice) => {
    setSelectedInvoiceForWhatsApp(invoice);
  };

  const handlePaymentSuccess = (result) => {
    setFeedback({
      type: 'success',
      message: `Pagamento de ${Number(result.valor_recebido || result.pagamento?.valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso!`
    });
    loadInvoices(true);
  };

  const handleCreateSuccess = (newInvoice) => {
    setFeedback({
      type: 'success',
      message: `Mensalidade de ${newInvoice.aluno_nome || 'aluno'} emitida com sucesso!`
    });
    loadInvoices(true);
  };

  const handleBatchSuccess = (result) => {
    const geradas = result.geradas || 0;
    const ignoradas = result.ignoradas !== undefined ? result.ignoradas : (result.ignoradas_existentes || 0);
    setFeedback({
      type: 'success',
      message: `Geração em lote concluída: ${geradas} novas faturas geradas (${ignoradas} alunos já possuíam mensalidade no mês).`
    });
    loadInvoices(true);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className={styles.page}>
      {/* Header Principal */}
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconCircle}>
            <DollarSign size={24} className={styles.titleIcon} />
          </div>
          <div>
            <h1 className={styles.title}>Mensalidades & Finanças</h1>
            <p className={styles.subtitle}>
              Controle de faturas, baixas rápidas e cobranças via WhatsApp
            </p>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.batchBtn}
            onClick={() => setIsBatchModalOpen(true)}
            title="Gerar mensalidades do mês para todos os alunos ativos"
          >
            <Layers size={18} />
            <span>Gerar Mês</span>
          </button>

          <button
            type="button"
            className={styles.createBtn}
            onClick={() => setIsCreateModalOpen(true)}
            title="Lançar fatura avulsa"
          >
            <Plus size={18} />
            <span>Nova Fatura</span>
          </button>
        </div>
      </header>

      {/* Alerta de Feedback */}
      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Cards de Resumo Financeiro */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.summaryOverdue}`}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryCardLabel}>Em Atraso</span>
            <AlertTriangle size={18} className={styles.overdueIcon} />
          </div>
          <div className={styles.summaryCardValue}>
            {formatCurrency(summaryMetrics.totalAtrasado)}
          </div>
          <span className={styles.summaryCardSub}>
            {summaryMetrics.qtdAtrasadas} fatura(s) vencida(s)
          </span>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryPending}`}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryCardLabel}>Total em Aberto</span>
            <Clock size={18} className={styles.pendingIcon} />
          </div>
          <div className={styles.summaryCardValue}>
            {formatCurrency(summaryMetrics.totalAberto)}
          </div>
          <span className={styles.summaryCardSub}>
            Pendentes + Atrasadas
          </span>
        </div>

        <div className={`${styles.summaryCard} ${styles.summaryPaid}`}>
          <div className={styles.summaryTop}>
            <span className={styles.summaryCardLabel}>Arrecadado</span>
            <CheckCircle2 size={18} className={styles.paidIcon} />
          </div>
          <div className={styles.summaryCardValue}>
            {formatCurrency(summaryMetrics.totalRecebido)}
          </div>
          <span className={styles.summaryCardSub}>
            {summaryMetrics.qtdPagas} fatura(s) quitada(s)
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={styles.filtersSection}>
        {/* Pills de Status */}
        <div className={styles.filterPills}>
          <button
            type="button"
            className={`${styles.pill} ${statusFilter === 'todas' ? styles.pillActive : ''}`}
            onClick={() => handleStatusFilterChange('todas')}
          >
            <span>Todas</span>
            <span className={styles.pillCount}>{summaryMetrics.totalGeral}</span>
          </button>

          <button
            type="button"
            className={`${styles.pill} ${styles.pillOverdue} ${statusFilter === 'atrasada' ? styles.pillActiveOverdue : ''}`}
            onClick={() => handleStatusFilterChange('atrasada')}
          >
            <span>Atrasadas</span>
            {summaryMetrics.qtdAtrasadas > 0 && (
              <span className={styles.pillCountOverdue}>{summaryMetrics.qtdAtrasadas}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.pill} ${styles.pillPending} ${statusFilter === 'pendente' ? styles.pillActivePending : ''}`}
            onClick={() => handleStatusFilterChange('pendente')}
          >
            <span>Pendentes</span>
            <span className={styles.pillCount}>{summaryMetrics.qtdPendentes}</span>
          </button>

          <button
            type="button"
            className={`${styles.pill} ${styles.pillPaid} ${statusFilter === 'paga' ? styles.pillActivePaid : ''}`}
            onClick={() => handleStatusFilterChange('paga')}
          >
            <span>Pagas</span>
            <span className={styles.pillCount}>{summaryMetrics.qtdPagas}</span>
          </button>
        </div>

        {/* Linha de Busca e Competência */}
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar por nome do aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            {searchTerm && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {competenciasDisponiveis.length > 0 && (
            <div className={styles.competenciaWrapper}>
              <select
                value={competenciaFilter}
                onChange={(e) => setCompetenciaFilter(e.target.value)}
                className={styles.competenciaSelect}
              >
                <option value="todas">Todas as Competências</option>
                {competenciasDisponiveis.map(comp => (
                  <option key={comp} value={comp}>
                    Mês {comp}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={() => loadInvoices(true)}
            className={styles.refreshBtn}
            title="Atualizar lista"
            disabled={loading || refreshing}
          >
            <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
          </button>
        </div>
      </div>

      {/* Lista de Faturas */}
      <section className={styles.invoicesList}>
        {loading && !refreshing ? (
          <div className={styles.loadingContainer}>
            <Loader2 size={32} className={styles.spinner} />
            <p>Carregando mensalidades...</p>
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className={styles.emptyContainer}>
            <FileText size={48} className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Nenhuma mensalidade encontrada</h3>
            <p className={styles.emptyText}>
              {searchTerm || statusFilter !== 'todas' || competenciaFilter !== 'todas'
                ? 'Tente ajustar os filtros ou o termo de busca.'
                : 'Clique em "Gerar Mês" para emitir faturas para os alunos ativos ou lance uma avulsa.'}
            </p>
            {!searchTerm && statusFilter === 'todas' && (
              <button
                type="button"
                className={styles.emptyActionBtn}
                onClick={() => setIsBatchModalOpen(true)}
              >
                <Layers size={18} />
                <span>Gerar Faturas do Mês</span>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.cardsGrid}>
            {filteredInvoices.map((inv) => (
              <InvoiceCard
                key={inv.id}
                invoice={inv}
                onPay={(item) => setSelectedInvoiceForPayment(item)}
                onWhatsAppBilling={handleWhatsAppBilling}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modais */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          isOpen={!!selectedInvoiceForPayment}
          onClose={() => setSelectedInvoiceForPayment(null)}
          invoice={selectedInvoiceForPayment}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {selectedInvoiceForWhatsApp && (
        <BillingMessageModal
          isOpen={!!selectedInvoiceForWhatsApp}
          onClose={() => setSelectedInvoiceForWhatsApp(null)}
          invoice={selectedInvoiceForWhatsApp}
        />
      )}

      {isCreateModalOpen && (
        <CreateInvoiceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {isBatchModalOpen && (
        <BatchGenerateModal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          onSuccess={handleBatchSuccess}
        />
      )}
    </div>
  );
}
