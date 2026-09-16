const inventoryService = require('../services/inventory.service');
const { ExpirationStatus } = require('../constants/enums');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const allIngredients = await inventoryService.getAll();
      
      const totalIngredients = allIngredients.length;
      const categories = new Set(allIngredients.map(i => i.category));
      const totalCategories = categories.size;
      
      const expiringCount = allIngredients.filter(i => 
        i.expirationStatus === ExpirationStatus.CRITICAL || 
        i.expirationStatus === ExpirationStatus.SOON
      ).length;
      
      const recentlyAdded = [...allIngredients].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5);

      res.json({
        success: true,
        data: {
          totalIngredients,
          totalCategories,
          expiringCount,
          recentlyAdded
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
