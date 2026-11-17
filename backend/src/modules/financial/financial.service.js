import { FinancialRepository } from './financial.repository.js';

export class FinancialService {
  /**
   * Validação de data
   */
  static validateDate(dateStr, fieldName = 'Data') {
    if (!dateStr) throw new Error(`${fieldName} é obrigatória.`);
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) {
      throw new Error(`${fieldName} inválida.`);
    }
  }

  /**
   * Validação de valor monetário
   */
  static validateAmount(amount, fieldName = 'Valor') {
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      throw new Error(`${fieldName} deve ser um valor positivo maior que zero.`);
    }
    return Number(num.toFixed(2));
  }

  /**
   * Listar mensalidades
   */
  static async list(academiaId, filters = {}) {
    if (!academiaId) throw new Error('Identificador da academia é obrigatório.');
    return FinancialRepository.list(academiaId, filters);
  }

  /**
   * Buscar detalhes de uma mensalidade
   */
  static async getById(academiaId, id) {
    if (!id) throw new Error('Identificador da mensalidade é obrigatório.');
    const invoice = await FinancialRepository.findById(academiaId, id);
    if (!invoice) {
      throw new Error('Mensalidade não encontrada.');
    }
    return invoice;
  }

  /**
   * Criar mensalidade individual
   */
  static async create(academiaId, data) {
    if (!data.aluno_id) throw new Error('Selecione um aluno para a mensalidade.');

    let competencia = data.competencia ? String(data.competencia).trim() : '';
    if (/^\d{4}-\d{2}$/.test(competencia)) {
      const [yyyy, mm] = competencia.split('-');
      competencia = `${mm}/${yyyy}`;
    }

    if (!competencia || !/^\d{2}\/\d{4}$/.test(competencia)) {
      throw new Error('Competência deve estar no formato MM/AAAA (ex: 11/2026).');
    }

    const valor = this.validateAmount(data.valor, 'Valor da mensalidade');
    this.validateDate(data.data_vencimento, 'Data de vencimento');

    const newId = await FinancialRepository.create(academiaId, {
      ...data,
      valor,
      competencia
    });

    return this.getById(academiaId, newId);
  }

  /**
   * Geração em lote para o mês
   */
  static async generateBatch(academiaId, data) {
    let competencia = data.competencia ? String(data.competencia).trim() : '';
    if (/^\d{4}-\d{2}$/.test(competencia)) {
      const [yyyy, mm] = competencia.split('-');
      competencia = `${mm}/${yyyy}`;
    }

    if (!competencia || !/^\d{2}\/\d{4}$/.test(competencia)) {
      throw new Error('Competência deve estar no formato MM/AAAA (ex: 11/2026).');
    }

    let dataVencimento = data.data_vencimento;
    if (!dataVencimento && data.dia_vencimento) {
      const [mm, yyyy] = competencia.split('/');
      const dia = String(data.dia_vencimento).padStart(2, '0');
      dataVencimento = `${yyyy}-${mm}-${dia}`;
    }

    this.validateDate(dataVencimento, 'Data de vencimento padrão');

    const valorPadrao = data.valor_padrao 
      ? this.validateAmount(data.valor_padrao, 'Valor padrão') 
      : 120.00;

    return FinancialRepository.generateBatch(academiaId, {
      competencia,
      data_vencimento: dataVencimento,
      valor_padrao: valorPadrao
    });
  }

  /**
   * Registrar quitação (baixa) de pagamento
   */
  static async registerPayment(academiaId, id, data, usuarioId = null) {
    const rawVal = data.valor !== undefined ? data.valor : data.valor_pago;
    const valor = this.validateAmount(rawVal, 'Valor do pagamento');
    if (data.data_pagamento) {
      this.validateDate(data.data_pagamento, 'Data de pagamento');
    }

    await FinancialRepository.registerPayment(academiaId, id, {
      ...data,
      valor,
      observacao: data.observacao || data.observacoes || null
    }, usuarioId);

    return this.getById(academiaId, id);
  }

  /**
   * Cancelar mensalidade
   */
  static async cancelInvoice(academiaId, id) {
    const cancelled = await FinancialRepository.cancelInvoice(academiaId, id);
    if (!cancelled) {
      throw new Error('Não foi possível cancelar a mensalidade.');
    }
    return { id, status: 'cancelada' };
  }

  static DEFAULT_TEMPLATES = {
    pendente: 'Oss, {primeiro_nome}! Tudo bem? Passando para lembrar da sua mensalidade ({competencia}) na {academia_nome}, no valor de {valor}, com vencimento em {vencimento}.{chave_pix_bloco}\n\nAo realizar o pagamento, favor enviar o comprovante por aqui. Muito obrigado e bons treinos! 🥋',
    atrasada: 'Oss, {primeiro_nome}! Tudo bem? Constatamos que a sua mensalidade ({competencia}) na {academia_nome}, no valor de {valor} (vencida em {vencimento}), encontra-se em aberto.{chave_pix_bloco}\n\nCaso já tenha realizado o pagamento, por favor nos envie o comprovante. Qualquer dúvida estamos à disposição! 🥋'
  };

  /**
   * Substitui variáveis dinâmicas no modelo de mensagem
   */
  static renderBillingMessage(template, variables) {
    let result = template || '';
    for (const [key, value] of Object.entries(variables)) {
      result = result.replaceAll(`{${key}}`, value !== null && value !== undefined ? String(value) : '');
    }
    return result;
  }

  /**
   * Gera texto e link de cobrança no WhatsApp
   */
  static async getWhatsAppBilling(academiaId, id, options = {}) {
    const invoice = await this.getById(academiaId, id);

    if (!invoice.aluno_telefone) {
      throw new Error('O aluno não possui telefone/WhatsApp cadastrado.');
    }

    const saldo = Number((invoice.valor - invoice.valor_pago).toFixed(2));
    if (saldo <= 0 || invoice.status === 'paga') {
      throw new Error('Esta mensalidade já está quitada.');
    }

    const cleanPhone = invoice.aluno_telefone.replace(/\D/g, '').replace(/^55/, '');
    const firstName = invoice.aluno_nome.trim().split(/\s+/)[0] || 'Aluno';
    const formattedValor = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const dateStr = invoice.data_vencimento instanceof Date 
      ? invoice.data_vencimento.toISOString() 
      : String(invoice.data_vencimento);
    const [year, month, day] = dateStr.split('T')[0].split('-');
    const formattedVenc = `${day}/${month}/${year}`;

    const chavePix = invoice.chave_pix || invoice.academia_pix || '';
    const titularPix = invoice.beneficiario_pix || '';
    const pixBloco = chavePix
      ? `\n\nChave PIX: ${chavePix}${titularPix ? ` (${titularPix})` : ''}`
      : '';

    const variables = {
      primeiro_nome: firstName,
      aluno_nome: invoice.aluno_nome.trim(),
      valor: formattedValor,
      vencimento: formattedVenc,
      competencia: invoice.competencia,
      academia_nome: invoice.academia_nome || 'Academia',
      chave_pix: chavePix,
      beneficiario_pix: titularPix,
      chave_pix_bloco: pixBloco
    };

    const templatePendente = invoice.msg_cobranca_pendente || this.DEFAULT_TEMPLATES.pendente;
    const templateAtrasada = invoice.msg_cobranca_atrasada || this.DEFAULT_TEMPLATES.atrasada;

    const renderedPendente = this.renderBillingMessage(templatePendente, variables);
    const renderedAtrasada = this.renderBillingMessage(templateAtrasada, variables);

    // Determina o tipo de cobrança (se não for explicitamente 'pendente' ou 'atrasada', usa o status da fatura)
    const isOverdue = invoice.status === 'atrasada';
    const requestedTipo = options.tipo === 'pendente' || options.tipo === 'atrasada' 
      ? options.tipo 
      : (isOverdue ? 'atrasada' : 'pendente');

    let finalMessage = options.customMensagem 
      ? options.customMensagem 
      : (requestedTipo === 'atrasada' ? renderedAtrasada : renderedPendente);

    const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;

    return {
      aluno_nome: invoice.aluno_nome,
      aluno_primeiro_nome: firstName,
      telefone: cleanPhone,
      saldo_devedor: saldo,
      status: invoice.status,
      tipo_selecionado: requestedTipo,
      mensagem: finalMessage,
      whatsapp_url: whatsappUrl,
      url: whatsappUrl,
      variaveis: variables,
      templates: {
        pendente: templatePendente,
        atrasada: templateAtrasada,
        mensagem_pendente_renderizada: renderedPendente,
        mensagem_atrasada_renderizada: renderedAtrasada
      }
    };
  }
}
