const seekaiProvider = require('./seekai.provider');
const promptBuilder = require('./prompt.builder');
const responseParser = require('./response.parser');

class AIService {
  async generateRecipes(context) {
    const { systemPrompt, userPrompt } = promptBuilder.buildRecipePrompt(context);
    const rawContent = await seekaiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseRecipeResponse(rawContent);
  }

  async generateChat(inventory, conversationHistory, userMessage) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    const rawContent = await seekaiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseChatResponse(rawContent);
  }

  async generateChatStream(inventory, conversationHistory, userMessage, onChunk) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    return seekaiProvider.generateCompletionStream({ systemPrompt, userPrompt, onChunk });
  }
}

module.exports = new AIService();
