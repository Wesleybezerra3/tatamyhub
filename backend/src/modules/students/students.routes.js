import { Router } from 'express';
import {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  setStudentStatus,
  addGraduation,
  deleteStudent
} from './students.controller.js';
import { authenticateJWT } from '../../middlewares/auth.js';
import { StudentPortalController } from '../studentPortal/studentPortal.controller.js';

export const studentsRouter = Router();

studentsRouter.use(authenticateJWT);

studentsRouter.get('/', listStudents);
studentsRouter.post('/', createStudent);
studentsRouter.get('/:id', getStudentById);
studentsRouter.put('/:id', updateStudent);
studentsRouter.patch('/:id/status', setStudentStatus);
studentsRouter.patch('/:id/credenciais', StudentPortalController.setCredentialsByAdmin);
studentsRouter.put('/:id/credenciais', StudentPortalController.setCredentialsByAdmin);
studentsRouter.post('/:id/graduacoes', addGraduation);
studentsRouter.delete('/:id', deleteStudent);
