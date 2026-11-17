import { ModalidadesService } from './modalidades.service.js';

export class ModalidadesController {
  static async list(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const { status } = req.query;
      const modalidades = await ModalidadesService.list(academiaId, status);
      res.status(200).json(modalidades);
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || null;
      const modalidade = await ModalidadesService.getById(req.params.id, academiaId);
      res.status(200).json(modalidade);
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const modalidade = await ModalidadesService.create({ ...req.body, academia_id: academiaId });
      res.status(201).json(modalidade);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || null;
      const updated = await ModalidadesService.update(req.params.id, req.body, academiaId);
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }
}
