import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/register', AuthController.register);
authRouter.post('/login', AuthController.login);
authRouter.get('/me', authenticateJWT, AuthController.me);
authRouter.delete('/account', authenticateJWT, AuthController.deleteAccount);
authRouter.delete('/conta', authenticateJWT, AuthController.deleteAccount);
