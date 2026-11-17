import React, { useState, useEffect, useCallback } from 'react';
import { Users, AlertTriangle, DollarSign, Layers, RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { dashboardService } from '../../services/dashboardService';
import { MetricCard } from '../../components/dashboard/MetricCard/MetricCard';
import { QuickActions } from '../../components/dashboard/QuickActions/QuickActions';
import { Alert } from '../../components/common/Alert/Alert';
import { Link } from 'react-router-dom';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  const { user, academia } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadMetrics = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await dashboardService.getMetrics();
      setMetrics(data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao carregar métricas do painel.' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getFirstName = (fullName) => {
    if (!fullName) return 'Professor';
    return fullName.trim().split(/\s+/)[0];
  };

  return (
    <div className={styles.page}>
      {/* Header com Boas-Vindas */}
      <header className={styles.welcomeBanner}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.welcomeTitle}>
            Oss, {getFirstName(user?.nome)}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            Acompanhe o resumo operacional e financeiro de {academia?.nome || 'sua academia'}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadMetrics(true)}
          className={styles.refreshBtn}
          title="Atualizar dados"
          disabled={loading || refreshing}
        >
          <RefreshCw size={16} className={refreshing ? styles.spinning : ''} />
          <span className={styles.refreshText}>Atualizar</span>
        </button>
      </header>

      {feedback && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onClose={() => setFeedback(null)}
        />
      )}

      {/* Ações Rápidas de 1 Toque */}
      <QuickActions onActionFeedback={(msg) => setFeedback({ type: 'info', message: msg })} />

      {/* Grid de Cards de Métricas */}
      <section className={styles.metricsSection}>
        <h2 className={styles.sectionTitle}>Métricas do Mês</h2>

        {loading && !metrics ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={32} />
            <p>Calculando indicadores do tatame...</p>
          </div>
        ) : (
          <div className={styles.metricsGrid}>
            <MetricCard
              title="Alunos Ativos"
              value={metrics?.alunos_ativos || 0}
              subtitle="Alunos matriculados"
              icon={<Users size={18} />}
              variant="primary"
            />

            <MetricCard
              title="Em Atraso"
              value={formatCurrency(metrics?.mensalidades_atrasadas_valor)}
              subtitle={`${metrics?.mensalidades_atrasadas_qtd || 0} fatura(s) pendente(s)`}
              icon={<AlertTriangle size={18} />}
              variant={metrics?.mensalidades_atrasadas_qtd > 0 ? 'danger' : 'default'}
              badgeText={metrics?.mensalidades_atrasadas_qtd > 0 ? 'Cobrar' : null}
            />

            <MetricCard
              title="Arrecadado no Mês"
              value={formatCurrency(metrics?.arrecadado_mes_valor)}
              subtitle="Pagamentos confirmados"
              icon={<DollarSign size={18} />}
              variant="success"
            />

            <MetricCard
              title="Modalidades Ativas"
              value={metrics?.modalidades_ativas_qtd || 0}
              subtitle="Disciplinas ofertadas"
              icon={<Layers size={18} />}
              variant="default"
            />
          </div>
        )}
      </section>

      {/* Seção de Alertas e Próximos Passos */}
      {metrics?.alertas && metrics.alertas.length > 0 && (
        <section className={styles.alertsSection}>
          <h2 className={styles.sectionTitle}>Avisos Importantes</h2>
          <div className={styles.alertsList}>
            {metrics.alertas.map((al) => (
              <div key={al.id} className={styles.alertCard}>
                <div className={styles.alertContent}>
                  <p>{al.mensagem}</p>
                </div>
                {al.acao_url && (
                  <Link to={al.acao_url} className={styles.alertLink}>
                    <span>Ver</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
