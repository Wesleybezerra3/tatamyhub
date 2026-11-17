import { Router } from 'express';
import {
  listInvoices,
  getInvoiceById,
  createInvoice,
  generateBatchInvoices,
  registerPayment,
  cancelInvoice,
  getWhatsAppBilling
} from './financial.controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

export const financialRouter = Router();

financialRouter.use(authenticateJWT);

financialRouter.get('/', listInvoices);
financialRouter.post('/', createInvoice);
financialRouter.post('/gerar-lote', generateBatchInvoices);
financialRouter.get('/:id', getInvoiceById);
financialRouter.post('/:id/pagamentos', registerPayment);
financialRouter.patch('/:id/cancelar', cancelInvoice);
financialRouter.get('/:id/cobranca-whatsapp', getWhatsAppBilling);
financialRouter.post('/:id/cobranca-whatsapp', getWhatsAppBilling);
