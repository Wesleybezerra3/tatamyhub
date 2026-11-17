import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, UserPlus, Award, Shield } from 'lucide-react';
import styles from './StudentsPlaceholderPage.module.css';

export function StudentsPlaceholderPage() {
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
          <Users size={36} className={styles.icon} />
        </div>

        <div className={styles.badgeWrapper}>
          <span className={styles.statusBadge}>Módulo em Desenvolvimento</span>
        </div>

        <h1 className={styles.title}>Gestão de Alunos & Graduações</h1>
        
        <p className={styles.description}>
          Em breve você poderá cadastrar alunos, acompanhar a frequência nas aulas, 
          histórico de faixas e graduações, além de contato direto via WhatsApp.
        </p>

        <div className={styles.featuresPreview}>
          <div className={styles.featureItem}>
            <UserPlus size={18} className={styles.featureIcon} />
            <span>Matrículas rápidas e controle de cadastro</span>
          </div>
          <div className={styles.featureItem}>
            <Award size={18} className={styles.featureIcon} />
            <span>Sistema de faixas e graus por modalidade</span>
          </div>
          <div className={styles.featureItem}>
            <Shield size={18} className={styles.featureIcon} />
            <span>Ficha médica e termos de responsabilidade</span>
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
