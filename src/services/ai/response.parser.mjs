import { AppError } from '../../middlewares/error.middleware.mjs';

export function parseRecipeResponse(rawContent) {
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

export function extractRecipeSuggestion(rawText) {
  if (!rawText) return { cleanText: '', recipeSuggestion: null };

  const tagRegex = /<<<RECIPE_SUGGESTION>>>([\s\S]*?)<<<END_RECIPE_SUGGESTION>>>/;
  const match = rawText.match(tagRegex);

  if (!match) {
    return { cleanText: rawText.trim(), recipeSuggestion: null };
  }

  const cleanText = rawText.replace(tagRegex, '').trim();
  let jsonString = match[1].trim();

  // Clean code fences if present
  if (jsonString.startsWith('```json')) jsonString = jsonString.replace(/^```json/, '');
  if (jsonString.startsWith('```')) jsonString = jsonString.replace(/^```/, '');
  if (jsonString.endsWith('```')) jsonString = jsonString.replace(/```$/, '');
  jsonString = jsonString.trim();

  try {
    const parsed = JSON.parse(jsonString);
    if (parsed && typeof parsed === 'object' && parsed.title) {
      const recipeSuggestion = {
        title: parsed.title,
        description: parsed.description || '',
        cookingTime: Number(parsed.cookingTime) || 30,
        difficulty: (parsed.difficulty || 'medium').toLowerCase(),
        ingredients: Array.isArray(parsed.ingredients) ? parsed.ingredients.map(i => ({
          ingredientName: i.ingredientName || i.name || 'Ingredient',
          quantity: Number(i.quantity) || 1,
          unit: i.unit || 'pcs',
          isOptional: Boolean(i.isOptional)
        })) : [],
        instructions: Array.isArray(parsed.instructions) ? parsed.instructions : []
      };
      return { cleanText, recipeSuggestion };
    }
  } catch (err) {
    console.warn('Failed to parse recipe suggestion JSON from chat response:', err.message);
  }

  return { cleanText, recipeSuggestion: null };
}

export function parseChatResponse(rawContent) {
  return (rawContent || '').trim();
}
