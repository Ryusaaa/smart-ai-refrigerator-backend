import express from 'express';
import authController from '../controllers/auth.controller.mjs';
import { validate } from '../middlewares/validation.middleware.mjs';
import { requireAuth } from '../middlewares/auth.middleware.mjs';
import { registerSchema, loginSchema } from '../validators/auth.validator.mjs';

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', requireAuth, authController.me);

export default router;