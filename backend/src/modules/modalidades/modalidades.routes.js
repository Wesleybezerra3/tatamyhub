import { Router } from 'express';
import { ModalidadesController } from './modalidades.controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';

export const modalidadesRouter = Router();

modalidadesRouter.use(authenticateJWT);

modalidadesRouter.get('/', ModalidadesController.list);
modalidadesRouter.get('/:id', ModalidadesController.getById);
modalidadesRouter.post('/', ModalidadesController.create);
modalidadesRouter.put('/:id', ModalidadesController.update);

