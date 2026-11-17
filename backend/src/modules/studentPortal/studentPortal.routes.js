import { Router } from 'express';
import { StudentPortalController } from './studentPortal.controller.js';
import { authenticateStudentJWT } from '../../middlewares/studentAuth.js';

export const studentPortalRouter = Router();

// Rota pública de login do aluno
studentPortalRouter.post('/login', StudentPortalController.login);

// Rotas protegidas por autenticação de aluno
studentPortalRouter.use(authenticateStudentJWT);

studentPortalRouter.get('/me', StudentPortalController.getMe);
studentPortalRouter.get('/hub', StudentPortalController.getHub);
studentPortalRouter.get('/mensalidades', StudentPortalController.getInvoices);
studentPortalRouter.post('/trocar-senha', StudentPortalController.changePassword);
