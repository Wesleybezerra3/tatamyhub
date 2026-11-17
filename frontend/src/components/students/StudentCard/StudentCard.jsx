import React from 'react';
import { MessageSquare, AlertCircle, Phone } from 'lucide-react';
import { BeltBadge } from '../BeltBadge/BeltBadge';
import styles from './StudentCard.module.css';

export function StudentCard({ student, onClick }) {
  const {
    id,
    nome,
    telefone,
    status,
    modalidade_nome,
    faixa_atual,
    graus_atual,
    observacoes_medicas
  } = student;

  const isInactive = status === 'inativo';

  // Iniciais do nome
  const getInitials = (fullName) => {
    if (!fullName) return 'AL';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Sanitizar telefone para link do WhatsApp
  const cleanPhone = telefone ? telefone.toString().replace(/\D/g, '') : null;
  const whatsappUrl = cleanPhone 
    ? `https://wa.me/55${cleanPhone.replace(/^55/, '')}` 
    : null;

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Formatação amigável do telefone para exibição
  const formatPhone = (digits) => {
    if (!digits) return '';
    const d = digits.replace(/^55/, '');
    if (d.length === 11) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    }
    if (d.length === 10) {
      return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    }
    return d;
  };

  return (
    <div 
      className={`${styles.card} ${isInactive ? styles.cardInactive : ''}`}
      onClick={() => onClick && onClick(student)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick(student);
        }
      }}
    >
      <div className={styles.mainRow}>
        {/* Avatar */}
        <div className={styles.avatar}>
          {getInitials(nome)}
        </div>

        {/* Informações Centrais */}
        <div className={styles.infoCol}>
          <div className={styles.titleRow}>
            <h3 className={styles.studentName}>{nome}</h3>
            {observacoes_medicas && (
              <span className={styles.medicalAlert} title={`Restrição médica: ${observacoes_medicas}`}>
                <AlertCircle size={14} />
              </span>
            )}
            {isInactive && (
              <span className={styles.inactiveBadge}>Inativo</span>
            )}
          </div>

          <div className={styles.badgesRow}>
            <span className={styles.modalityPill}>
              {modalidade_nome || student.modalidades?.[0]?.modalidade_nome || 'Geral'}
            </span>

            <BeltBadge 
              faixa={faixa_atual || 'Branca'} 
              graus={graus_atual || 0} 
              size="sm" 
            />
          </div>
        </div>

        {/* Ação Direta WhatsApp */}
        {cleanPhone ? (
          <button
            type="button"
            className={styles.whatsappBtn}
            onClick={handleWhatsAppClick}
            title={`Abrir WhatsApp (${formatPhone(cleanPhone)})`}
            aria-label={`Conversar no WhatsApp com ${nome}`}
          >
            <MessageSquare size={18} />
          </button>
        ) : (
          <div className={styles.noPhoneBadge} title="Telefone não informado">
            <Phone size={14} className={styles.noPhoneIcon} />
          </div>
        )}
      </div>
    </div>
  );
}
