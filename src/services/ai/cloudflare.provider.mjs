import env from '../../config/env.mjs';
import { AIProviderError } from '../../middlewares/error.middleware.mjs';

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
  return /\b503\b|UNAVAILABLE|overloaded|high demand|\b429\b|rate limit|ECONNRESET|ETIMEDOUT|fetch failed/i.test(text);
}

function assertConfigured() {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
    throw new AIProviderError(500, 'Cloudflare Workers AI is not configured. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env file.');
  }
}

function endpoint() {
  return `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${env.CLOUDFLARE_AI_MODEL}`;
}

function buildMessages(systemPrompt, userPrompt) {
  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];
}

async function generateCompletion({ systemPrompt, userPrompt, onStatus }) {
  assertConfigured();
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS + 1; attempt++) {
    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: buildMessages(systemPrompt, userPrompt),
          max_tokens: env.CLOUDFLARE_AI_MAX_TOKENS,
          temperature: env.CLOUDFLARE_AI_TEMPERATURE
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        const error = new Error(`Cloudflare AI request failed (${res.status}): ${errText}`);
        error.status = res.status;
        throw error;
      }

      const data = await res.json();
      if (!data.success) {
        throw new AIProviderError(502, `Cloudflare AI error: ${JSON.stringify(data.errors)}`);
      }

      const text = data.result?.response;
      if (!text) {
        throw new AIProviderError(502, 'Cloudflare AI returned an empty response');
      }
      return text;
    } catch (error) {
      lastError = error;
      console.error(`Cloudflare AI error (attempt ${attempt}/${RETRY_ATTEMPTS + 1}):`, error.message);

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
  throw new AIProviderError(502, `Cloudflare AI request failed: ${lastError?.message || 'Unknown error'}`);
}

async function generateCompletionStream({ systemPrompt, userPrompt, onChunk, onStatus }) {
  assertConfigured();
  let lastError = null;

  for (let attempt = 1; attempt <= RETRY_ATTEMPTS + 1; attempt++) {
    let attemptText = '';
    let firstChunkReceived = false;

    try {
      const res = await fetch(endpoint(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
         body: JSON.stringify({
          messages: buildMessages(systemPrompt, userPrompt),
          max_tokens: env.CLOUDFLARE_AI_MAX_TOKENS,
          temperature: env.CLOUDFLARE_AI_TEMPERATURE,
          stream: true,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = res.body ? await res.text() : 'No response body';
        const error = new Error(`Cloudflare AI stream request failed (${res.status}): ${errText}`);
        error.status = res.status;
        throw error;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;

          const payload = trimmed.slice(5).trim();
          if (payload === '[DONE]') continue;

          try {
            const parsed = JSON.parse(payload);
            const chunkText = parsed.response;
            if (chunkText) {
              firstChunkReceived = true;
              attemptText += chunkText;
              if (onChunk) onChunk(chunkText);
            }
          } catch {
            // ignore malformed SSE fragments
          }
        }
      }

      return attemptText;
    } catch (error) {
      lastError = error;
      console.error(`Cloudflare AI stream error (attempt ${attempt}/${RETRY_ATTEMPTS + 1}):`, error.message);

      if (firstChunkReceived && attemptText) {
        return attemptText;
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

  throw new AIProviderError(502, `Cloudflare AI streaming request failed: ${lastError?.message || 'Unknown error'}`);
}

export default {
  generateCompletion,
  generateCompletionStream,
};