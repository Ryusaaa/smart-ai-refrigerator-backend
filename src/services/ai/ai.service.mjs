import geminiProvider from './gemini.provider.mjs';
import * as promptBuilder from './prompt.builder.mjs';
import * as responseParser from './response.parser.mjs';

class AIService {
  async generateRecipes(context) {
    const { systemPrompt, userPrompt } = promptBuilder.buildRecipePrompt(context);
    const rawContent = await geminiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseRecipeResponse(rawContent);
  }

  async generateChat(inventory, conversationHistory, userMessage) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    const rawContent = await geminiProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseChatResponse(rawContent);
  }

  async generateChatStream(inventory, conversationHistory, userMessage, onChunk, onStatus) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    return geminiProvider.generateCompletionStream({ systemPrompt, userPrompt, onChunk, onStatus });
  }
}

export default new AIService();