import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, DollarSign, CalendarCheck, FileSpreadsheet } from 'lucide-react';
import styles from './PaymentsPlaceholderPage.module.css';

export function PaymentsPlaceholderPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          type="button" 
          onClick={() => navigate('/dashboard')}
          className={styles.backButton}
        >
          <ArrowLeft size={18} />
          <span>Voltar ao Início</span>
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.iconCircle}>
          <CreditCard size={36} className={styles.icon} />
        </div>

        <div className={styles.badgeWrapper}>
          <span className={styles.statusBadge}>Módulo em Desenvolvimento</span>
        </div>

        <h1 className={styles.title}>Gestão Financeira & Mensalidades</h1>
        
        <p className={styles.description}>
          O controle financeiro completo do seu tatame estará disponível aqui: 
          baixa de mensalidades com 1 toque, geração de PIX, controle de inadimplência e comprovantes.
        </p>

        <div className={styles.featuresPreview}>
          <div className={styles.featureItem}>
            <DollarSign size={18} className={styles.featureIcon} />
            <span>Baixa rápida de mensalidades (PIX, Cartão e Dinheiro)</span>
          </div>
          <div className={styles.featureItem}>
            <CalendarCheck size={18} className={styles.featureIcon} />
            <span>Alertas automáticos de vencimento e inadimplência</span>
          </div>
          <div className={styles.featureItem}>
            <FileSpreadsheet size={18} className={styles.featureIcon} />
            <span>Relatórios simplificados de faturamento mensal</span>
          </div>
        </div>

        <button 
          type="button" 
          onClick={() => navigate('/dashboard')}
          className={styles.primaryBtn}
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}
