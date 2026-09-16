function buildRecipePrompt(context) {
  const systemPrompt = `You are a professional chef and smart refrigerator assistant. 
Return ONLY valid JSON format. Do not include any markdown formatting, thoughts, or extra text.
The JSON must have a single key "recipes" containing an array of recipe objects.
Each recipe must have: title (string), description (string), cookingTime (number in minutes), difficulty (string), ingredients (array of objects with ingredientName, quantity, unit, isOptional), instructions (array of strings).`;

  const available = context.availableIngredients.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');
  const expiring = context.expiringIngredients.map(i => `${i.name} (expires in ${i.daysUntilExpiry} days)`).join(', ');

  const userPrompt = `I have the following ingredients available: ${available || 'none'}.
The following ingredients are expiring soon and should be prioritized: ${expiring || 'none'}.
Preferences: Max cooking time ${context.preferences.maxCookingTime || 240} mins, difficulty: ${context.preferences.difficulty || 'any'}, cuisine: ${context.preferences.cuisine || 'any'}, max missing ingredients: ${context.preferences.maxMissingIngredients || 2}.
Generate 3 recipe recommendations based on these ingredients and preferences. Return ONLY valid JSON.`;

  return { systemPrompt, userPrompt };
}

function buildChatPrompt(inventory, conversationHistory, userMessage) {
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
10. If information is unavailable, say that it is unavailable.`;

  const inventoryText = inventory.length > 0
    ? inventory.map(i => `- ${i.name}: ${i.quantity} ${i.unit}${i.daysUntilExpiry !== null && i.daysUntilExpiry !== undefined ? ` (expires in ${i.daysUntilExpiry} days)` : ''}`).join('\n')
    : 'No ingredients currently in inventory.';

  const historyText = conversationHistory.length > 0
    ? conversationHistory.map(m => `${m.role === 'USER' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')
    : '';

  const userPrompt = `Current Refrigerator Inventory:\n${inventoryText}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${userMessage}`;

  return { systemPrompt, userPrompt };
}

module.exports = {
  buildRecipePrompt,
  buildChatPrompt
};
