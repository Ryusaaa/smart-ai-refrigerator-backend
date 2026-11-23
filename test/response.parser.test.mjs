import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractRecipeSuggestion,
  parseRecipeResponse,
  RECIPE_TAG_END,
  RECIPE_TAG_START,
} from '../src/services/ai/response.parser.mjs';

const malformedRecipe = `{
  "title": "Pasta with Scrambled Eggs and Vegetables",
  "description": "A quick breakfast recipe.",
  "cookingTime": 15,
  "difficulty": "easy",
  "ingredients": [
    { "ingredientName": "Pasta", "quantity": 200, "unit": "g", "isOptional": },
    { "ingredientName": "Egg", "quantity": 2, "unit": "pcs", "isOptional": false }
  ],
  "instructions": ["Boil the pasta.", "Scramble the eggs."]
}`;

test('parseRecipeResponse defaults an empty isOptional field to false', () => {
  const recipes = parseRecipeResponse(`{"recipes":[${malformedRecipe}]}`);

  assert.equal(recipes.length, 1);
  assert.equal(recipes[0].ingredients[0].isOptional, false);
  assert.equal(recipes[0].ingredients[1].isOptional, false);
});

test('extractRecipeSuggestion recovers a chat recipe with an empty isOptional field', () => {
  const response = `Here is a recipe.\n${RECIPE_TAG_START}${malformedRecipe}${RECIPE_TAG_END}`;
  const result = extractRecipeSuggestion(response);

  assert.equal(result.cleanText, 'Here is a recipe.');
  assert.equal(result.hasRecipeBlock, true);
  assert.equal(result.recipeSuggestion.ingredients[0].isOptional, false);
});