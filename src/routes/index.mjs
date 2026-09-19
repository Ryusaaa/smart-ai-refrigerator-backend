import express from 'express';

import authRouter from './auth.routes.mjs';
import dashboardRouter from './dashboard.routes.mjs';
import ingredientRouter from './ingredient.routes.mjs';
import recipeRouter from './recipe.routes.mjs';
import chatRouter from './chat.routes.mjs';
import voiceRouter from './voice.routes.mjs';
import deviceRouter from './device.routes.mjs';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/dashboard', dashboardRouter);
router.use('/ingredients', ingredientRouter);
router.use('/recipes', recipeRouter);
router.use('/chat', chatRouter);
router.use('/voice', voiceRouter);
router.use('/device', deviceRouter);

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date() }));

export default router;