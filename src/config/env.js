require('dotenv').config();

const requiredEnvs = ['DATABASE_URL'];
const missingEnvs = requiredEnvs.filter(key => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`[WARN] Missing environment variables: ${missingEnvs.join(', ')}. Copy .env.example to .env and fill in values.`);
}

const normalizeAiBaseUrl = (value) => {
  if (!value) return 'https://seekai.cc';

  const sanitized = value.trim().replace(/\/+$/, '');
  return sanitized.replace(/\/v1$/i, '');
};

const rawAiBaseUrl = process.env.AI_BASE_URL || process.env.SEEKAI_BASE_URL || process.env.TABIAI_BASE_URL || 'https://seekai.cc';
const aiBaseUrl = normalizeAiBaseUrl(rawAiBaseUrl);

if (rawAiBaseUrl !== aiBaseUrl) {
  console.warn(`[WARN] AI_BASE_URL was normalized from "${rawAiBaseUrl}" to "${aiBaseUrl}" to avoid duplicate /v1 paths.`);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  AI_BASE_URL: aiBaseUrl,
  AI_API_KEY: process.env.AI_API_KEY || process.env.SEEKAI_API_KEY || process.env.TABIAI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || process.env.SEEKAI_MODEL || process.env.TABIAI_MODEL || 'gemini-3.8-flash',
  AUDIO_ENCRYPTION_KEY: process.env.AUDIO_ENCRYPTION_KEY || null,
  IMAGE_SEARCH_PROVIDER: process.env.IMAGE_SEARCH_PROVIDER || 'unsplash',
  IMAGE_SEARCH_API_KEY: process.env.IMAGE_SEARCH_API_KEY || null,
  IMAGE_SEARCH_ENGINE_ID: process.env.IMAGE_SEARCH_ENGINE_ID || null,
  RECIPE_SEARCH_PROVIDER: process.env.RECIPE_SEARCH_PROVIDER || null,
  RECIPE_SEARCH_API_KEY: process.env.RECIPE_SEARCH_API_KEY || null,
};
