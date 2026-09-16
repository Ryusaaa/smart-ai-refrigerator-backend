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
  const systemPrompt = `You are SMARTAI, a helpful smart refrigerator assistant. You help users manage their food inventory, suggest recipes, and answer food-related questions.`;
  
  let historyText = conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n');
  const inventoryText = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');

  const userPrompt = `Current Inventory: ${inventoryText || 'Empty'}\n\nChat History:\n${historyText}\n\nUser: ${userMessage}`;

  return { systemPrompt, userPrompt };
}

module.exports = {
  buildRecipePrompt,
  buildChatPrompt
};
