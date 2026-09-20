export const RECIPE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    recipes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          cookingTime: { type: 'number' },
          difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
          ingredients: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                ingredientName: { type: 'string' },
                quantity: { type: 'number' },
                unit: { type: 'string' },
                isOptional: { type: 'boolean' },
              },
              required: ['ingredientName', 'quantity', 'unit', 'isOptional'],
            },
          },
          instructions: { type: 'array', items: { type: 'string' } },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                url: { type: 'string' },
                note: { type: 'string' },
              },
              required: ['title', 'url'],
            },
          },
        },
        required: ['title', 'description', 'cookingTime', 'difficulty', 'ingredients', 'instructions'],
      },
    },
  },
  required: ['recipes'],
};

export function buildRecipePrompt(context, { attempt = 1 } = {}) {
  const systemPrompt = `You are a professional chef and smart refrigerator assistant.
Return ONLY one valid JSON object. No markdown, no code fences, no thoughts, no text before or after the JSON.
The JSON must have a single key "recipes" containing an array of recipe objects.
Each recipe must have:
- title (string)
- description (string, max 2 short sentences)
- cookingTime (number in minutes)
- difficulty (one of: "easy", "medium", "hard")
- ingredients (array of objects with ingredientName (string), quantity (number), unit (string), isOptional (boolean))
- instructions (array of strings, max 8 short steps)
- sources (optional array of objects with title: string, url: string, note: string - real reference links only; use [] if you are not sure)

STRICT JSON RULES:
- quantity must be a plain decimal number (write 0.5, never 1/2 or "secukupnya"; use 0 if the amount is unspecified).
- Escape any double quote inside a string as \\" and never put line breaks inside a string.
- No comments and no trailing commas.
- Keep every recipe concise so the whole JSON is complete.`;

  const available = context.availableIngredients.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  const expiring = context.expiringIngredients.map(i => `${i.name} (expires in ${i.daysUntilExpiry} days)`).join(', ');

  const retryHint = attempt > 1
    ? `\nYour previous reply was not valid JSON. Reply again with ONLY the JSON object, complete and properly closed.`
    : '';

  const userPrompt = `I have the following ingredients available: ${available || 'none'}.
The following ingredients are expiring soon and should be prioritized: ${expiring || 'none'}.
Preferences: Max cooking time ${context.preferences.maxCookingTime || 240} mins, difficulty: ${context.preferences.difficulty || 'any'}, cuisine: ${context.preferences.cuisine || 'any'}, max missing ingredients: ${context.preferences.maxMissingIngredients || 2}.
Generate 3 recipe recommendations based on these ingredients and preferences. Include inspiration cooking references in 'sources' where appropriate. Return ONLY valid JSON.${retryHint}`;

  return { systemPrompt, userPrompt };
}

export function buildChatPrompt(inventory, conversationHistory, userMessage) {
  const systemPrompt = `You are SMARTAI Refrigerator Assistant.

You help the user cook using the ingredients currently available in their refrigerator.

Rules:
1. Treat database inventory as the source of truth.
2. Do not claim an ingredient is available unless it is in inventory.
3. Prefer recipes using available ingredients.
4. Prioritize ingredients close to expiration when appropriate.
5. Minimize unnecessary additional ingredients.
6. Respect user cooking preferences.
7. Explain missing ingredients clearly.
8. If the user asks about inventory, answer from the provided inventory context.
9. Do not invent inventory data.
10. If information is unavailable, say that it is unavailable.

STRUCTURED RECIPE BLOCK (read carefully, this is a strict formatting rule):
If, and only if, you are recommending ONE concrete recipe the user can cook right now, end your reply with the exact block below, appended after your normal natural-language answer.
- Do NOT write any heading, label, or introduction for this block (do NOT write things like "Blok data terstruktur", "Structured data", "JSON:", or anything similar).
- Do NOT explain that you are adding this block. Do NOT wrap it in extra commentary.
- Simply output it silently, starting on a new line right after your last sentence.
- The block must be the very last thing in your reply.

<<<RECIPE_SUGGESTION>>>
{
  "title": "Nama Resep",
  "description": "Deskripsi ringkas resep",
  "cookingTime": 25,
  "difficulty": "easy",
  "ingredients": [
    { "ingredientName": "Nama Bahan", "quantity": 200, "unit": "g", "isOptional": false }
  ],
  "instructions": [
    "Langkah 1...",
    "Langkah 2..."
  ]
}
<<<END_RECIPE_SUGGESTION>>>

The JSON inside the tags must be valid. If you are only answering a general question, chit-chatting, or not suggesting a specific recipe, do NOT include the <<<RECIPE_SUGGESTION>>> block at all — just end your reply normally.`;

  const inventoryText = inventory.length > 0
    ? inventory.map(i => `- ${i.name}: ${i.quantity} ${i.unit}${i.daysUntilExpiry !== null && i.daysUntilExpiry !== undefined ? ` (expires in ${i.daysUntilExpiry} days)` : ''}`).join('\n')
    : 'No ingredients currently in inventory.';

  const historyText = conversationHistory.length > 0
    ? conversationHistory.map(m => `${m.role === 'USER' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
    : '';

  const userPrompt = `Current Refrigerator Inventory:\n${inventoryText}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${userMessage}`;

  return { systemPrompt, userPrompt };
}
