import express from 'express';
import deviceController from '../controllers/device.controller.mjs';

const router = express.Router();

router.get('/status', deviceController.getStatus);
router.post('/inventory', deviceController.syncInventory);

export default router;
