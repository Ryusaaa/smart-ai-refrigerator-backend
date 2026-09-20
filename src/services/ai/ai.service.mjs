import cloudflareProvider from './cloudflare.provider.mjs';
import * as promptBuilder from './prompt.builder.mjs';
import * as responseParser from './response.parser.mjs';

const RECIPE_MAX_ATTEMPTS = 3;

class AIService {
  async generateRecipes(context) {
    let lastError = null;

    for (let attempt = 1; attempt <= RECIPE_MAX_ATTEMPTS; attempt++) {
      const { systemPrompt, userPrompt } = promptBuilder.buildRecipePrompt(context, { attempt });

      const rawContent = await cloudflareProvider.generateCompletion({
        systemPrompt,
        userPrompt,
        responseFormat: promptBuilder.RECIPE_JSON_SCHEMA,
      });

      try {
        return responseParser.parseRecipeResponse(rawContent);
      } catch (error) {
        if (!(error instanceof responseParser.RecipeParseError)) throw error;
        lastError = error;
        console.warn(`[AI] Format resep tidak valid (percobaan ${attempt}/${RECIPE_MAX_ATTEMPTS}), mencoba lagi...`);
      }
    }

    throw lastError;
  }

  async generateChat(inventory, conversationHistory, userMessage) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    const rawContent = await cloudflareProvider.generateCompletion({ systemPrompt, userPrompt });
    return responseParser.parseChatResponse(rawContent);
  }

  async generateChatStream(inventory, conversationHistory, userMessage, onChunk, onStatus) {
    const { systemPrompt, userPrompt } = promptBuilder.buildChatPrompt(inventory, conversationHistory, userMessage);
    return cloudflareProvider.generateCompletionStream({ systemPrompt, userPrompt, onChunk, onStatus });
  }
}

export default new AIService();