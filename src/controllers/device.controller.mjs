import inventoryService from '../services/inventory.service.mjs';
import { IngredientSource } from '../constants/enums.mjs';

class DeviceController {
  async syncInventory(req, res, next) {
    try {
      const { deviceId, items } = req.body;
      if (!Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          error: 'Items must be an array',
        });
      }

      const synced = [];
      for (const item of items) {
        const ingredient = await inventoryService.create({
          name: item.name,
          category: item.category || 'Other',
          quantity: Number(item.quantity) || 1,
          unit: item.unit || 'pcs',
          expiryDate: item.expiryDate ? new Date(item.expiryDate) : null,
          source: item.source || IngredientSource.HARDWARE,
        });
        synced.push(ingredient);
      }

      return res.status(201).json({
        success: true,
        message: 'Device inventory synced successfully',
        data: {
          deviceId: deviceId || 'DEVICE_UNKNOWN',
          syncedCount: synced.length,
          items: synced,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getStatus(req, res, next) {
    try {
      return res.json({
        success: true,
        data: {
          status: 'READY',
          protocolVersion: '1.0.0',
          supportedSources: [
            IngredientSource.CAMERA,
            IngredientSource.SENSOR,
            IngredientSource.HARDWARE,
            IngredientSource.AI_SCAN,
          ],
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new DeviceController();
