import { GoogleGenAI } from '@google/genai';
import env from '../../config/env.mjs';
import { AIProviderError } from '../../middlewares/error.middleware.mjs';

let client = null;

function getClient() {
  if (!env.AI_API_KEY) {
    throw new AIProviderError(500, 'GEMINI_API_KEY is not configured. Set it in your .env file.');
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: env.AI_API_KEY });
  }
  return client;
}

const RETRY_ATTEMPTS = 4;
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 8000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function backoffDelay(attempt) {
  const exponential = Math.min(MAX_DELAY_MS, BASE_DELAY_MS * 2 ** (attempt - 1));
  const jitter = Math.random() * 400;
  return exponential + jitter;
}

function isRetryableError(error) {
  const text = `${error?.message || ''} ${error?.status || ''} ${error?.code || ''}`;
  return /\b503\b|UNAVAILABLE|overloaded|high demand|\b429\b|RESOURCE_EXHAUSTED|rate limit|ECONNRESET|ETIMEDOUT|fetch failed/i.test(text);
}

async function generateCompletion({ systemPrompt, userPrompt, onStatus }) {
  const ai = getClient();
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS + 1; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: env.AI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      const text = response.text;
      if (!text) {
        throw new AIProviderError(502, 'Gemini returned an empty response');
      }
      return text;
    } catch (error) {
      lastError = error;
      console.error(`Gemini API error (attempt ${attempt}/${RETRY_ATTEMPTS + 1}):`, error.message);

      const canRetry = isRetryableError(error) && attempt <= RETRY_ATTEMPTS;
      if (!canRetry) break;

      const delay = backoffDelay(attempt);
      if (onStatus) {
        onStatus(`Model AI sedang sibuk, mencoba lagi... (percobaan ${attempt + 1}/${RETRY_ATTEMPTS + 1})`);
      }
      await sleep(delay);
    }
  }

  if (lastError instanceof AIProviderError) throw lastError;
  throw new AIProviderError(502, `Gemini API request failed: ${lastError?.message || 'Unknown error'}`);
}

async function generateCompletionStream({ systemPrompt, userPrompt, onChunk, onStatus }) {
  const ai = getClient();
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS + 1; attempt++) {
    let attemptText = '';
    let firstChunkReceived = false;

    try {
      const stream = await ai.models.generateContentStream({
        model: env.AI_MODEL,
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
        },
      });

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          firstChunkReceived = true;
          attemptText += chunkText;
          if (onChunk) onChunk(chunkText);
        }
      }

      return attemptText;
    } catch (error) {
      lastError = error;
      console.error(`Gemini API stream error (attempt ${attempt}/${RETRY_ATTEMPTS + 1}):`, error.message);

      if (firstChunkReceived) {
        if (attemptText) return attemptText;
      }

      const canRetry = isRetryableError(error) && attempt <= RETRY_ATTEMPTS;
      if (!canRetry) break;

      const delay = backoffDelay(attempt);
      if (onStatus) {
        onStatus(`Model AI sedang sibuk, mencoba lagi... (percobaan ${attempt + 1}/${RETRY_ATTEMPTS + 1})`);
      }
      await sleep(delay);
    }
  }

  throw new AIProviderError(502, `Gemini API streaming request failed: ${lastError?.message || 'Unknown error'}`);
}

export default {
  generateCompletion,
  generateCompletionStream,
};