const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const now = Date.now();
  const day = 86400000;

  const ingredients = [
    { name: 'Chicken Breast', category: 'Meat', quantity: 500, unit: 'g', expiryDate: new Date(now + 3 * day) },
    { name: 'Egg', category: 'Dairy/Protein', quantity: 6, unit: 'pcs', expiryDate: new Date(now + 5 * day) },
    { name: 'Carrot', category: 'Vegetable', quantity: 3, unit: 'pcs', expiryDate: new Date(now + 1 * day) },
    { name: 'Rice', category: 'Grain', quantity: 1000, unit: 'g', expiryDate: null },
    { name: 'Garlic', category: 'Spice', quantity: 10, unit: 'cloves', expiryDate: null },
    { name: 'Soy Sauce', category: 'Sauce', quantity: 250, unit: 'ml', expiryDate: null },
    { name: 'Milk', category: 'Dairy', quantity: 500, unit: 'ml', expiryDate: new Date(now + 2 * day) },
    { name: 'Tomato', category: 'Vegetable', quantity: 4, unit: 'pcs', expiryDate: new Date(now + 4 * day) },
    { name: 'Onion', category: 'Vegetable', quantity: 3, unit: 'pcs', expiryDate: new Date(now + 14 * day) },
    { name: 'Butter', category: 'Dairy', quantity: 200, unit: 'g', expiryDate: new Date(now + 10 * day) },
    { name: 'All-Purpose Flour', category: 'Grain', quantity: 500, unit: 'g', expiryDate: null },
    { name: 'Salt', category: 'Spice', quantity: 500, unit: 'g', expiryDate: null },
    { name: 'Black Pepper', category: 'Spice', quantity: 50, unit: 'g', expiryDate: null },
    { name: 'Olive Oil', category: 'Oil', quantity: 500, unit: 'ml', expiryDate: null },
    { name: 'Broccoli', category: 'Vegetable', quantity: 2, unit: 'heads', expiryDate: new Date(now + 3 * day) },
    { name: 'Bell Pepper', category: 'Vegetable', quantity: 3, unit: 'pcs', expiryDate: new Date(now + 6 * day) },
    { name: 'Potato', category: 'Vegetable', quantity: 5, unit: 'pcs', expiryDate: new Date(now + 20 * day) },
    { name: 'Mushroom', category: 'Vegetable', quantity: 200, unit: 'g', expiryDate: new Date(now + 2 * day) },
    { name: 'Cheese', category: 'Dairy', quantity: 200, unit: 'g', expiryDate: new Date(now + 7 * day) },
    { name: 'Lemon', category: 'Fruit', quantity: 3, unit: 'pcs', expiryDate: new Date(now + 8 * day) },
    { name: 'Pasta', category: 'Grain', quantity: 400, unit: 'g', expiryDate: null },
    { name: 'Cumin', category: 'Spice', quantity: 30, unit: 'g', expiryDate: null },
    { name: 'Turmeric', category: 'Spice', quantity: 20, unit: 'g', expiryDate: null },
    { name: 'Beef Mince', category: 'Meat', quantity: 400, unit: 'g', expiryDate: new Date(now + 2 * day) },
    { name: 'Spinach', category: 'Vegetable', quantity: 150, unit: 'g', expiryDate: new Date(now + 1 * day) },
    { name: 'Ginger', category: 'Spice', quantity: 100, unit: 'g', expiryDate: new Date(now + 10 * day) },
    { name: 'Coconut Milk', category: 'Sauce', quantity: 400, unit: 'ml', expiryDate: null },
    { name: 'Fish Sauce', category: 'Sauce', quantity: 200, unit: 'ml', expiryDate: null },
    { name: 'Shrimp', category: 'Seafood', quantity: 300, unit: 'g', expiryDate: new Date(now + 1 * day) },
    { name: 'Green Beans', category: 'Vegetable', quantity: 200, unit: 'g', expiryDate: new Date(now + 5 * day) }
  ];

  console.log('Seeding database...');
  for (const ingredient of ingredients) {
    await prisma.ingredient.create({
      data: ingredient,
    });
  }
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
