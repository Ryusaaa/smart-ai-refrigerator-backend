import authService from '../services/auth.service.mjs';
import { UnauthorizedError } from './error.middleware.mjs';

export const requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const payload = authService.verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    next(error);
  }
};