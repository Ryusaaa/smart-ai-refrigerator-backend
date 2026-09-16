// server/prisma/scripts/backfillIngredientImages.js
// One-time script to backfill imageUrl for existing ingredients (per update_v3.md Phase 31)

const { PrismaClient } = require('@prisma/client');
const imageService = require('../../src/services/image/image.service');

const prisma = new PrismaClient();

async function backfill() {
  console.log('Starting ingredient image backfill...');
  const ingredients = await prisma.ingredient.findMany({
    where: {
      OR: [
        { imageUrl: null },
        { imageUrl: '' }
      ]
    }
  });

  console.log(`Found ${ingredients.length} ingredients needing images.`);

  for (const ing of ingredients) {
    try {
      const url = await imageService.getIngredientImage(ing.name);
      if (url) {
        await prisma.ingredient.update({
          where: { id: ing.id },
          data: { imageUrl: url }
        });
        console.log(`[OK] Updated ${ing.name} -> ${url}`);
      }
    } catch (err) {
      console.warn(`[WARN] Failed to fetch image for ${ing.name}:`, err.message);
    }
  }

  console.log('Backfill completed.');
}

backfill()
  .catch(err => {
    console.error('Backfill error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
