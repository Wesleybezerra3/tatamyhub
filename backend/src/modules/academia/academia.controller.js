import { AcademiaService } from './academia.service.js';

export class AcademiaController {
  static async getProfile(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const profile = await AcademiaService.getProfile(academiaId);
      if (!profile) {
        return res.status(200).json(null);
      }
      res.status(200).json(profile);
    } catch (err) {
      next(err);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const updated = await AcademiaService.saveProfile({ ...req.body, id: academiaId });
      res.status(200).json(updated);
    } catch (err) {
      next(err);
    }
  }

  static async uploadLogo(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const result = await AcademiaService.handleLogoUpload(req.file, academiaId);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteLogo(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const result = await AcademiaService.removeLogo(academiaId);
      res.status(200).json({ message: 'Logotipo removido com sucesso.', profile: result });
    } catch (err) {
      next(err);
    }
  }
}
