import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import env from '../config/env.mjs';
import userRepository from '../repositories/user.repository.mjs';
import { ConflictError, UnauthorizedError, NotFoundError } from '../middlewares/error.middleware.mjs';

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
}

function signToken(user) {
  return jwt.sign({ sub: user.id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

class AuthService {
  async register({ name, email, password }) {
    const existing = await userRepository.findByEmail(email.toLowerCase());
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });

    return { user: toPublicUser(user), token: signToken(user) };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    return { user: toPublicUser(user), token: signToken(user) };
  }

  async getCurrentUser(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return toPublicUser(user);
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (e) {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }
}

export default new AuthService();