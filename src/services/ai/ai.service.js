const tabiaiProvider = require('./tabiai.provider');
const promptBuilder = require('./prompt.builder');
const responseParser = require('./response.parser');

class AIService {
  async generateRecipes(context) {
    const { systemPrompt, userPrompt } = promptBuilder.buildRecipePrompt(context);
    const rawContent = await tabiaiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseRecipeResponse(rawContent);
  }

  async generateChat(inventory, conversationHistory, userMessage) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    const rawContent = await tabiaiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseChatResponse(rawContent);
  }
}

module.exports = new AIService();
