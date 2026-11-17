import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, UserPlus, MessageSquare, Building2 } from 'lucide-react';
import styles from './QuickActions.module.css';

export function QuickActions({ onActionFeedback }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'pay',
      label: 'Registrar Pagamento',
      icon: <CreditCard size={20} />,
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.12)',
      onClick: () => {
        navigate('/mensalidades?status=pendente');
      }
    },
    {
      id: 'student',
      label: 'Cadastrar Aluno',
      icon: <UserPlus size={20} />,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.12)',
      onClick: () => {
        navigate('/alunos');
      }
    },
    {
      id: 'whatsapp',
      label: 'Cobrança WhatsApp',
      icon: <MessageSquare size={20} />,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.12)',
      onClick: () => {
        navigate('/mensalidades?status=atrasada');
      }
    },
    {
      id: 'academy',
      label: 'Minha Academia',
      icon: <Building2 size={20} />,
      color: '#8B5CF6',
      bg: 'rgba(139, 92, 246, 0.12)',
      onClick: () => {
        navigate('/configuracoes/academia');
      }
    }
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.sectionTitle}>Ações Rápidas</h3>
      <div className={styles.grid}>
        {actions.map((act) => (
          <button
            key={act.id}
            type="button"
            className={styles.actionBtn}
            onClick={act.onClick}
          >
            <div className={styles.iconWrapper} style={{ backgroundColor: act.bg, color: act.color }}>
              {act.icon}
            </div>
            <span className={styles.label}>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
