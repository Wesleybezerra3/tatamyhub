import { DashboardService } from './dashboard.service.js';

export class DashboardController {
  static async getMetrics(req, res, next) {
    try {
      const academiaId = req.user?.academia_id || 1;
      const metrics = await DashboardService.getMetrics(academiaId);
      res.status(200).json(metrics);
    } catch (err) {
      next(err);
    }
  }
}
