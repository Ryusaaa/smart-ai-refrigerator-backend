const fetch = require('node-fetch');
const env = require('../../config/env');
const { AIProviderError } = require('../../middlewares/error.middleware');

async function generateCompletion({ systemPrompt, userPrompt }) {
  const payload = {
    model: env.TABIAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  };

  const response = await fetch(`${env.TABIAI_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.TABIAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new AIProviderError(response.status, `AI Provider Error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

module.exports = { generateCompletion };
