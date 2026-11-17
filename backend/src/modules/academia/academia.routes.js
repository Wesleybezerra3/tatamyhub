import { Router } from 'express';
import { AcademiaController } from './academia.controller.js';
import { AuthController } from '../auth/auth.controller.js';
import { uploadLogo } from '../../middlewares/upload.js';
import { authenticateJWT } from '../../middlewares/auth.js';

export const academiaRouter = Router();

academiaRouter.use(authenticateJWT);

academiaRouter.get('/', AcademiaController.getProfile);
academiaRouter.put('/', AcademiaController.updateProfile);
academiaRouter.delete('/', AuthController.deleteAccount);
academiaRouter.post('/logo', uploadLogo.single('logo'), AcademiaController.uploadLogo);
academiaRouter.delete('/logo', AcademiaController.deleteLogo);

