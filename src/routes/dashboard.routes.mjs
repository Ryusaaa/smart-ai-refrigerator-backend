import express from 'express';
import dashboardController from '../controllers/dashboard.controller.mjs';

const router = express.Router();

router.get('/', dashboardController.getDashboard);

export default router;
