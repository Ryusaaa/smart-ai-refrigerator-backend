import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = ['DATABASE_URL'];
const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`[WARN] Missing environment variables: ${missingEnvs.join(', ')}. Copy .env.example to .env and fill in values.`);
}

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,

  // Gemini AI configuration (@google/genai)
  AI_API_KEY: process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '',
  AI_MODEL: process.env.GEMINI_MODEL || process.env.AI_MODEL || 'gemini-2.5-flash',

  AUDIO_ENCRYPTION_KEY: process.env.AUDIO_ENCRYPTION_KEY || null,
  IMAGE_SEARCH_PROVIDER: process.env.IMAGE_SEARCH_PROVIDER || 'unsplash',
  IMAGE_SEARCH_API_KEY: process.env.IMAGE_SEARCH_API_KEY || null,
  IMAGE_SEARCH_ENGINE_ID: process.env.IMAGE_SEARCH_ENGINE_ID || null,
  RECIPE_SEARCH_PROVIDER: process.env.RECIPE_SEARCH_PROVIDER || null,
  RECIPE_SEARCH_API_KEY: process.env.RECIPE_SEARCH_API_KEY || null,
};

if (!env.AI_API_KEY) {
  console.warn('[WARN] GEMINI_API_KEY is not set. AI features (recipe generation, chat) will fail until it is configured in .env.');
}

export default env;
