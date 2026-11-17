import { api } from './api';

export const financialService = {
  /**
   * Lista mensalidades com filtros opcionais (status, competencia, search)
   */
  async listInvoices(filters = {}) {
    return api.get('/mensalidades', filters);
  },

  /**
   * Obtém detalhes de uma mensalidade e seu histórico de pagamentos
   */
  async getInvoiceById(id) {
    return api.get(`/mensalidades/${id}`);
  },

  /**
   * Cria uma nova mensalidade avulsa
   */
  async createInvoice(data) {
    return api.post('/mensalidades', data);
  },

  /**
   * Gera mensalidades em lote para todos os alunos ativos do mês
   */
  async generateBatch(data) {
    return api.post('/mensalidades/gerar-lote', data);
  },

  /**
   * Alias para geração de mensalidades em lote
   */
  async generateBatchInvoices(data) {
    return api.post('/mensalidades/gerar-lote', data);
  },

  /**
   * Registra baixa/pagamento (total ou parcial) em uma mensalidade
   */
  async registerPayment(id, paymentData) {
    return api.post(`/mensalidades/${id}/pagamentos`, paymentData);
  },

  /**
   * Cancela uma fatura que não possui pagamentos
   */
  async cancelInvoice(id) {
    return api.patch(`/mensalidades/${id}/cancelar`, {});
  },

  /**
   * Obtém a URL e mensagem pronta de cobrança via WhatsApp
   */
  async getWhatsAppBilling(id, params = {}) {
    return api.get(`/mensalidades/${id}/cobranca-whatsapp`, params);
  }
};
