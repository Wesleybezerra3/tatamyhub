import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { academiaRouter } from './modules/academia/academia.routes.js';
import { modalidadesRouter } from './modules/modalidades/modalidades.routes.js';
import { studentsRouter } from './modules/students/students.routes.js';
import { financialRouter } from './modules/financial/financial.routes.js';
import { studentPortalRouter } from './modules/studentPortal/studentPortal.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas de Autenticação e Onboarding
router.use('/auth', authRouter);

// Rota do Portal do Aluno
router.use('/aluno', studentPortalRouter);

// Rota do Dashboard
router.use('/dashboard', dashboardRouter);

// Rotas de Alunos e Graduações
router.use('/alunos', studentsRouter);

// Rotas Financeiras e Mensalidades
router.use('/mensalidades', financialRouter);

// Rotas da Academia e Modalidades
router.use('/academia', academiaRouter);
router.use('/modalidades', modalidadesRouter);

export default router;
