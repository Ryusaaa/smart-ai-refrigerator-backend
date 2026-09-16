const inventoryService = require('../services/inventory.service');

class IngredientController {
  async getAll(req, res, next) {
    try {
      const { search, category, expiryStatus } = req.query;
      const data = await inventoryService.getAll({ search, category, expiryStatus });
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const data = await inventoryService.getById(req.params.id);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const data = await inventoryService.create(req.body);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const data = await inventoryService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async remove(req, res, next) {
    try {
      await inventoryService.remove(req.params.id);
      res.json({ success: true, data: { id: req.params.id } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new IngredientController();
