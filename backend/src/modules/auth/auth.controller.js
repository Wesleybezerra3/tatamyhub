import { AuthService } from './auth.service.js';

export class AuthController {
  static async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      const result = await AuthService.getMe(req.user.id);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAccount(req, res, next) {
    try {
      const result = await AuthService.deleteAccount(req.user.id, req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}
