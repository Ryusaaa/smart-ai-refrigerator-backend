const { AppError } = require('../../middlewares/error.middleware');

function parseRecipeResponse(rawContent) {
  try {
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    const data = JSON.parse(cleaned);
    
    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new AppError('Invalid response format: missing recipes array', 500);
    }
    
    // Normalize and sanitize sources
    data.recipes.forEach(recipe => {
      if (Array.isArray(recipe.sources)) {
        recipe.sources = recipe.sources.filter(s => {
          if (!s || typeof s !== 'object' || !s.title || !s.url) return false;
          try {
            const url = new URL(s.url);
            return url.protocol === 'http:' || url.protocol === 'https:';
          } catch (e) {
            return false;
          }
        });
      } else {
        recipe.sources = [];
      }
    });

    return data.recipes;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Failed to parse AI response as JSON', 500);
  }
}

function parseChatResponse(rawContent) {
  return rawContent.trim();
}

module.exports = {
  parseRecipeResponse,
  parseChatResponse
};
