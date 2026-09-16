const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');

router.get('/status', deviceController.getStatus);
router.post('/inventory', deviceController.syncInventory);

module.exports = router;
