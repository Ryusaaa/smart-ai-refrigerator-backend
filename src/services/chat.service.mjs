import conversationRepository from '../repositories/conversation.repository.mjs';
import recipeRepository from '../repositories/recipe.repository.mjs';
import inventoryService from './inventory.service.mjs';
import imageService from './image/image.service.mjs';
import aiService from './ai/ai.service.mjs';import { extractRecipeSuggestion, createRecipeStreamFilter } from './ai/response.parser.mjs';
import { MessageRole } from '../constants/enums.mjs';

class ChatService {
  async sendMessage(conversationId, userMessage) {
    let convId = conversationId;
    if (!convId) {
      const conv = await conversationRepository.createConversation('New Conversation');
      convId = conv.id;
    }

    const conversation = await conversationRepository.findById(convId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const history = conversation.messages.slice(-10);
    const inventory = await inventoryService.getAvailableIngredients();

    await conversationRepository.addMessage(convId, MessageRole.USER, userMessage);

    const assistantResponse = await aiService.generateChat(inventory, history, userMessage);
    const { cleanText, recipeSuggestion } = extractRecipeSuggestion(assistantResponse);
    const textToSave = cleanText || assistantResponse;

    await conversationRepository.addMessage(convId, MessageRole.ASSISTANT, textToSave);

    let savedRecipe = null;
    if (recipeSuggestion) {
      try {
        const imageUrl = await imageService.getRecipeImage(recipeSuggestion.title);
        savedRecipe = await recipeRepository.create({
          ...recipeSuggestion,
          imageUrl
        });
      } catch (err) {
        console.warn('Failed to save suggested recipe from chat:', err.message);
      }
    }

    return {
      conversationId: convId,
      message: textToSave,
      recipe: savedRecipe
    };
  }

    async sendMessageStream(conversationId, userMessage, { onStatus, onChunk, onRecipe, onRecipePending, onRecipeFailed }) {
    let convId = conversationId;
    if (!convId) {
      const conv = await conversationRepository.createConversation('New Conversation');
      convId = conv.id;
    }

    const conversation = await conversationRepository.findById(convId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    if (onStatus) onStatus('Mengecek stok kulkas...');
    const inventory = await inventoryService.getAvailableIngredients();

    if (onStatus) onStatus('Menyusun konteks percakapan...');
    const history = conversation.messages.slice(-10);

    await conversationRepository.addMessage(convId, MessageRole.USER, userMessage);

    let fullAssistantResponse = '';
    const streamFilter = createRecipeStreamFilter({
      onText: (text) => { if (onChunk) onChunk(text); },
      onRecipeStart: () => { if (onRecipePending) onRecipePending(); },
    });

    await aiService.generateChatStream(
      inventory,
      history,
      userMessage,
      (chunk) => {
        fullAssistantResponse += chunk;
        streamFilter.push(chunk);
      },
      onStatus
    );

    streamFilter.flush();

    const { cleanText, recipeSuggestion, hasRecipeBlock } = extractRecipeSuggestion(fullAssistantResponse);
    const textToSave = cleanText || fullAssistantResponse;

    if (textToSave) {
      await conversationRepository.addMessage(convId, MessageRole.ASSISTANT, textToSave);
    }

    let savedRecipe = null;
    if (recipeSuggestion) {
      try {
        if (onStatus) onStatus('Menyiapkan visual resep...');
        const imageUrl = await imageService.getRecipeImage(recipeSuggestion.title);
        savedRecipe = await recipeRepository.create({
          ...recipeSuggestion,
          imageUrl
        });
        if (onRecipe && savedRecipe) {
          onRecipe(savedRecipe);
        }
      } catch (err) {
        console.warn('Failed to save suggested recipe from chat:', err.message);
      }
    }
    if ((streamFilter.inRecipeBlock || hasRecipeBlock) && !savedRecipe && onRecipeFailed) {
      onRecipeFailed('Resep tidak dapat diproses');
    }

    return {
      conversationId: convId,
      message: textToSave,
      recipe: savedRecipe
    };
  }
}

export default new ChatService();