require('dotenv').config();

const requiredEnvs = ['DATABASE_URL'];
const missingEnvs = requiredEnvs.filter(key => !process.env[key]);

if (missingEnvs.length > 0) {
  console.warn(`[WARN] Missing environment variables: ${missingEnvs.join(', ')}. Copy .env.example to .env and fill in values.`);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  AI_BASE_URL: process.env.AI_BASE_URL || process.env.SEEKAI_BASE_URL || process.env.TABIAI_BASE_URL || 'https://seekai.cc',
  AI_API_KEY: process.env.AI_API_KEY || process.env.SEEKAI_API_KEY || process.env.TABIAI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || process.env.SEEKAI_MODEL || process.env.TABIAI_MODEL || 'gemini-3.8-flash',
  AUDIO_ENCRYPTION_KEY: process.env.AUDIO_ENCRYPTION_KEY || null,
};
