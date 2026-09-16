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

module.exports = { generateCompletion };
