import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

export const dashboardRouter = Router();

// Endpoint protegido para obter métricas da academia do usuário logado
dashboardRouter.get('/metrics', authenticateJWT, DashboardController.getMetrics);
