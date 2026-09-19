import authService from '../services/auth.service.mjs';

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const data = await authService.register({ name, email, password });
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const data = await authService.login({ email, password });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const data = await authService.getCurrentUser(req.userId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();