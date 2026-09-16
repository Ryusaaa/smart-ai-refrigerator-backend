const express = require('express');
const router = express.Router();

const dashboardRouter = require('./dashboard.routes');
const ingredientRouter = require('./ingredient.routes');
const recipeRouter = require('./recipe.routes');
const chatRouter = require('./chat.routes');
const voiceRouter = require('./voice.routes');
const deviceRouter = require('./device.routes');

router.use('/dashboard', dashboardRouter);
router.use('/ingredients', ingredientRouter);
router.use('/recipes', recipeRouter);
router.use('/chat', chatRouter);
router.use('/voice', voiceRouter);
router.use('/device', deviceRouter);

router.get('/health', (req, res) => res.json({ success: true, status: 'ok', timestamp: new Date() }));

module.exports = router;
