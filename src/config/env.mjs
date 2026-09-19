import dotenv from 'dotenv';
dotenv.config();

const requiredEnvs = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvs = requiredEnvs.filter((key) => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`[WARN] Missing environment variables: ${missingEnvs.join(', ')}. Copy .env.example to .env and fill in values.`);
}

const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  // Service AI Cloudflare
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID || '',
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN || '',
  CLOUDFLARE_AI_MODEL: process.env.CLOUDFLARE_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct',
  CLOUDFLARE_AI_MAX_TOKENS: Number(process.env.CLOUDFLARE_AI_MAX_TOKENS) || 4096,
  CLOUDFLARE_AI_TEMPERATURE: Number(process.env.CLOUDFLARE_AI_TEMPERATURE ?? 0.4),

  AUDIO_ENCRYPTION_KEY: process.env.AUDIO_ENCRYPTION_KEY || null,
  IMAGE_SEARCH_PROVIDER: process.env.IMAGE_SEARCH_PROVIDER || 'unsplash',
  IMAGE_SEARCH_API_KEY: process.env.IMAGE_SEARCH_API_KEY || null,
  IMAGE_SEARCH_ENGINE_ID: process.env.IMAGE_SEARCH_ENGINE_ID || null,
  RECIPE_SEARCH_PROVIDER: process.env.RECIPE_SEARCH_PROVIDER || null,
  RECIPE_SEARCH_API_KEY: process.env.RECIPE_SEARCH_API_KEY || null,
};

if (env.JWT_SECRET === 'dev_insecure_secret_change_me') {
  console.warn('[WARN] JWT_SECRET is not set. Using an insecure default — set JWT_SECRET in .env before deploying.');
}

if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CLOUDFLARE_API_TOKEN) {
  console.warn('[WARN] CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_API_TOKEN is not set. The chatbot will fail until they are configured in .env.');
}

export default env;