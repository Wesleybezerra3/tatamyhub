import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, DollarSign, MessageCircle, Layers, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import styles from './LandingPage.module.css';

export function LandingPage() {
  const { isAuthenticated } = useAuth();

  // Se já estiver logado, redireciona direto para o painel
  if (isAuthenticated) {
    return <Navigate to="/configuracoes/academia" replace />;
  }

  return (
    <div className={styles.landingWrapper}>
      {/* Navbar Superior */}
      <header className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.brand}>
            <div className={styles.logoBadge}>
              <ShieldCheck size={24} className={styles.logoIcon} />
            </div>
            <span className={styles.brandName}>TatamyHub</span>
          </div>

          <div className={styles.navActions}>
            <Link to="/login" className={styles.loginLink}>
              Entrar
            </Link>
            <Link to="/cadastro" className={styles.ctaHeaderBtn}>
              Criar Conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.pillTag}>
            <span className={styles.pillDot} />
            SaaS de Gestão para Dojos e Academias de Luta
          </div>

          <h1 className={styles.heroTitle}>
            A gestão financeira e de alunos que o seu tatame merece.
          </h1>

          <p className={styles.heroSubtitle}>
            Elimine planilhas confusas e esquecimentos de cobrança. O TatamyHub foi desenhado sob medida para professores de Jiu-Jitsu acompanharem mensalidades, modalidades e comunicação direto no celular.
          </p>

          <div className={styles.heroButtons}>
            <Link to="/cadastro" className={styles.primaryBtn}>
              <span>Começar Agora</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className={styles.secondaryBtn}>
              Já tenho conta
            </Link>
          </div>

          {/* Highlights rápidas */}
          <div className={styles.highlightsRow}>
            <div className={styles.highlightItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>Sem cartão para iniciar</span>
            </div>
            <div className={styles.highlightItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>100% Mobile-first</span>
            </div>
            <div className={styles.highlightItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>Configuração em 2 minutos</span>
            </div>
          </div>
        </div>
      </section>

      {/* Seção dos Pilares do SaaS */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Feito para a rotina do professor</h2>
            <p className={styles.sectionDescription}>
              Foco exclusivo no que resolve os problemas reais da sua academia, sem botões inúteis.
            </p>
          </div>

          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconBadge}>
                <DollarSign size={24} />
              </div>
              <h3>Controle de Mensalidades</h3>
              <p>
                Diferencie cobranças de pagamentos reais. Acompanhe inadimplentes e registre amortizações parciais com histórico auditável.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBadge}>
                <MessageCircle size={24} />
              </div>
              <h3>Lembretes via WhatsApp</h3>
              <p>
                Facilite a comunicação com os alunos enviando lembretes de vencimento rápidos e diretos com o valor e a chave PIX da academia.
              </p>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconBadge}>
                <Layers size={24} />
              </div>
              <h3>Modalidades & Planos</h3>
              <p>
                Organize Jiu-Jitsu (Gi e No-Gi), Muay Thai, Judô ou Boxe com separação clara de planos e status ativo por aluno.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner de Chamada Final */}
      <section className={styles.bottomCtaSection}>
        <div className={styles.bottomCtaContainer}>
          <h2>Pronto para organizar o financeiro da sua academia?</h2>
          <p>Cadastre sua academia em menos de dois minutos e tenha total controle do seu tatame.</p>
          <Link to="/cadastro" className={styles.primaryBtnLarge}>
            <span>Criar Minha Conta Grátis</span>
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 TatamyHub — Sistema de Gestão para Academias de Jiu-Jitsu.</p>
      </footer>
    </div>
  );
}
