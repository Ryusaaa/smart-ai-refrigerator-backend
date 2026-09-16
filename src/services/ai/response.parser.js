const { AppError } = require('../../middlewares/error.middleware');

function parseRecipeResponse(rawContent) {
  try {
    let cleaned = rawContent.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '');
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '');
    if (cleaned.endsWith('```')) cleaned = cleaned.replace(/```$/, '');
    cleaned = cleaned.trim();

    const data = JSON.parse(cleaned);
    
    if (!data.recipes || !Array.isArray(data.recipes)) {
      throw new AppError('Invalid response format: missing recipes array', 500);
    }
    
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
