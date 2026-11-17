import { FinancialService } from './financial.service.js';

export async function listInvoices(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const { status, competencia, search, aluno_id } = req.query;

    const invoices = await FinancialService.list(academiaId, {
      status,
      competencia,
      search,
      aluno_id
    });

    return res.status(200).json(invoices);
  } catch (err) {
    console.error('[FinancialController] Erro ao listar mensalidades:', err.message);
    return res.status(500).json({ error: err.message || 'Erro ao listar mensalidades.' });
  }
}

export async function getInvoiceById(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Identificador de fatura inválido.' });
    }

    const invoice = await FinancialService.getById(academiaId, id);
    return res.status(200).json(invoice);
  } catch (err) {
    const status = err.message.includes('não encontrada') ? 404 : 400;
    return res.status(status).json({ error: err.message });
  }
}

export async function createInvoice(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const invoice = await FinancialService.create(academiaId, req.body);
    return res.status(201).json(invoice);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function generateBatchInvoices(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const result = await FinancialService.generateBatch(academiaId, req.body);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function registerPayment(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Identificador de fatura inválido.' });
    }
    const usuarioId = req.user?.id || null;

    const updated = await FinancialService.registerPayment(academiaId, id, req.body, usuarioId);
    return res.status(201).json(updated);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function cancelInvoice(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Identificador de fatura inválido.' });
    }

    const result = await FinancialService.cancelInvoice(academiaId, id);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}

export async function getWhatsAppBilling(req, res) {
  try {
    const academiaId = req.user?.academia_id || 1;
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Identificador de fatura inválido.' });
    }

    const tipo = req.query?.tipo || req.body?.tipo;
    const customMensagem = req.query?.custom_mensagem || req.body?.custom_mensagem;

    const result = await FinancialService.getWhatsAppBilling(academiaId, id, {
      tipo,
      customMensagem
    });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
