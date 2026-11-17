import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, AlertCircle, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { financialService } from '../../../services/financialService';
import styles from './BillingMessageModal.module.css';

export function BillingMessageModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [selectedType, setSelectedType] = useState('pendente');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        setCopied(false);

        const data = await financialService.getWhatsAppBilling(invoice.id);
        if (!isMounted) return;

        setBillingData(data);
        const initialType = data.tipo_selecionado || (invoice.status === 'atrasada' ? 'atrasada' : 'pendente');
        setSelectedType(initialType);

        const initialMsg = initialType === 'atrasada'
          ? (data.templates?.mensagem_atrasada_renderizada || data.mensagem)
          : (data.templates?.mensagem_pendente_renderizada || data.mensagem);

        setMessageText(initialMsg || '');
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || 'Erro ao carregar dados de cobrança.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (isOpen && invoice) {
      loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [isOpen, invoice]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    if (!billingData) return;

    if (type === 'atrasada') {
      setMessageText(billingData.templates?.mensagem_atrasada_renderizada || billingData.mensagem);
    } else {
      setMessageText(billingData.templates?.mensagem_pendente_renderizada || billingData.mensagem);
    }
  };

  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenWhatsApp = () => {
    if (!messageText) return;
    const phone = billingData?.telefone || invoice.aluno_telefone?.replace(/\D/g, '').replace(/^55/, '');
    if (!phone) {
      setError('Telefone do aluno não informado.');
      return;
    }
    const finalUrl = `https://wa.me/55${phone}?text=${encodeURIComponent(messageText)}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const formatCurrency = (val) => {
    return Number(val || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const isOverdue = invoice.status === 'atrasada';

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <div className={styles.iconCircle}>
              <MessageSquare size={20} color="#25D366" />
            </div>
            <div>
              <h3>Cobrança via WhatsApp</h3>
              <p>Personalize e envie o lembrete de mensalidade</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fechar modal">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <Loader2 className={styles.spinner} size={32} />
              <p>Preparando dados e mensagem de cobrança...</p>
            </div>
          ) : error ? (
            <div className={styles.errorAlert}>
              <AlertCircle size={20} color="#EF4444" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Aluno & Fatura Chips */}
              <div className={styles.summaryBar}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Aluno:</span>
                  <span className={styles.summaryValue}>{invoice.aluno_nome}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Competência:</span>
                  <span className={styles.summaryValue}>{invoice.competencia}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Valor:</span>
                  <span className={styles.summaryValue}>{formatCurrency(invoice.saldo_devedor || invoice.valor)}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Status:</span>
                  <span className={`${styles.statusBadge} ${isOverdue ? styles.statusAtrasada : styles.statusPendente}`}>
                    {isOverdue ? 'Atrasada' : 'Pendente'}
                  </span>
                </div>
              </div>

              {/* Seletor de Modelo */}
              <div className={styles.typeSelectorGroup}>
                <label className={styles.fieldLabel}>Modelo da Mensagem:</label>
                <div className={styles.typeButtons}>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${selectedType === 'pendente' ? styles.typeBtnActivePendente : ''}`}
                    onClick={() => handleTypeChange('pendente')}
                  >
                    🟡 Lembrete Preventivo
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeBtn} ${selectedType === 'atrasada' ? styles.typeBtnActiveAtrasada : ''}`}
                    onClick={() => handleTypeChange('atrasada')}
                  >
                    🔴 Cobrança de Atraso
                  </button>
                </div>
              </div>

              {/* Textarea editável na hora */}
              <div className={styles.fieldGroup}>
                <div className={styles.fieldHeaderRow}>
                  <label htmlFor="modal_custom_message" className={styles.fieldLabel}>
                    Mensagem a ser enviada (editável):
                  </label>
                  <span className={styles.hint}>Você pode ajustar o texto antes de enviar</span>
                </div>
                <textarea
                  id="modal_custom_message"
                  className={styles.messageTextarea}
                  rows={7}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Escreva a mensagem..."
                />
              </div>

              {/* Link para configurar modelos padrão */}
              <div className={styles.settingsLinkRow}>
                <Sparkles size={14} color="#3B82F6" />
                <span>
                  Quer mudar o texto padrão de todas as mensagens?{' '}
                  <Link to="/perfil-academia" onClick={onClose} className={styles.settingsLink}>
                    Personalizar em Perfil da Academia
                  </Link>
                </span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            type="button"
            className={styles.copyBtn}
            onClick={handleCopy}
            disabled={loading || !messageText}
            title="Copiar texto da mensagem"
          >
            {copied ? <Check size={16} color="#34D399" /> : <Copy size={16} />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>

          <div className={styles.footerRight}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancelar
            </button>
            <button
              type="button"
              className={styles.sendWhatsAppBtn}
              onClick={handleOpenWhatsApp}
              disabled={loading || !messageText || Boolean(error)}
              title="Abrir WhatsApp com a mensagem preparada"
            >
              <Send size={16} />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
