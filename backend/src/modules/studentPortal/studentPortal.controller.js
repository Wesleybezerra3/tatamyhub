import { StudentPortalService } from './studentPortal.service.js';

export class StudentPortalController {
  static async login(req, res, next) {
    try {
      const result = await StudentPortalService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req, res, next) {
    try {
      const result = await StudentPortalService.getMe(req.student.aluno_id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getHub(req, res, next) {
    try {
      const result = await StudentPortalService.getHubOverview(req.student.aluno_id, req.student.academia_id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async getInvoices(req, res, next) {
    try {
      const { status } = req.query;
      const result = await StudentPortalService.getInvoices(req.student.aluno_id, req.student.academia_id, status);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const result = await StudentPortalService.changePassword(req.student.aluno_id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async setCredentialsByAdmin(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const alunoId = parseInt(req.params.id, 10);
      const result = await StudentPortalService.setCredentialsByAdmin(academiaId, alunoId, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
