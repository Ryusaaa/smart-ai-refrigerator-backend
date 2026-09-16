const fetch = require('node-fetch');
const env = require('../../config/env');
const { AIProviderError } = require('../../middlewares/error.middleware');

async function generateCompletion({ systemPrompt, userPrompt }) {
  const payload = {
    model: env.AI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 4000
  };

  const response = await fetch(`${env.AI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || errorBody?.message || response.statusText;
    throw new AIProviderError(response.status, `AI Provider Error: ${message}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateCompletionStream({ systemPrompt, userPrompt, onChunk }) {
  const payload = {
    model: env.AI_MODEL,
    stream: true,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 4000
  };

  const response = await fetch(`${env.AI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.AI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok || !response.body) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message || errorBody?.message || response.statusText;
    throw new AIProviderError(response.status, `AI Provider Error: ${message}`);
  }

  let buffer = '';
  return new Promise((resolve, reject) => {
    response.body.on('data', (chunk) => {
      buffer += chunk.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop(); // Keep partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const payload = trimmed.replace(/^data:\s*/, '');
        if (payload === '[DONE]') {
          return resolve();
        }

        try {
          const parsed = JSON.parse(payload);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            onChunk(delta);
          }
        } catch (e) {
          // Ignore incomplete JSON chunks
        }
      }
    });

    response.body.on('end', () => resolve());
    response.body.on('error', (err) => reject(err));
  });
}

module.exports = {
  generateCompletion,
  generateCompletionStream
};
