const inventoryService = require('../services/inventory.service');
const { ExpirationStatus } = require('../constants/enums');

class DashboardController {
  async getDashboard(req, res, next) {
    try {
      const allIngredients = await inventoryService.getAll();
      
      const totalIngredients = allIngredients.length;
      const categories = new Set(allIngredients.map(i => i.category));
      const totalCategories = categories.size;
      
      const expiringItems = allIngredients.filter(i => 
        i.expirationStatus === ExpirationStatus.CRITICAL || 
        i.expirationStatus === ExpirationStatus.SOON
      );

      const categoryCountMap = {};
      allIngredients.forEach(i => {
        categoryCountMap[i.category] = (categoryCountMap[i.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(categoryCountMap).map(([name, count]) => ({
        name,
        count
      }));

      const recentlyAdded = [...allIngredients]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      res.json({
        success: true,
        data: {
          stats: {
            totalIngredients,
            totalCategories,
            categoriesCount: totalCategories,
            expiringCount: expiringItems.length,
          },
          totalIngredients,
          totalCategories,
          expiringCount: expiringItems.length,
          expiringItems,
          categoryBreakdown,
          recentlyAdded
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
