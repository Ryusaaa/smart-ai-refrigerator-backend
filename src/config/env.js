require('dotenv').config();

const requiredEnvs = ['DATABASE_URL', 'TABIAI_BASE_URL', 'TABIAI_API_KEY', 'TABIAI_MODEL'];
const missingEnvs = requiredEnvs.filter(env => !process.env[env]);

if (missingEnvs.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvs.join(', ')}`);
}

module.exports = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  TABIAI_BASE_URL: process.env.TABIAI_BASE_URL,
  TABIAI_API_KEY: process.env.TABIAI_API_KEY,
  TABIAI_MODEL: process.env.TABIAI_MODEL,
  AUDIO_ENCRYPTION_KEY: process.env.AUDIO_ENCRYPTION_KEY || null,
};
