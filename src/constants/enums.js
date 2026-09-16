const IngredientSource = {
  MANUAL: 'MANUAL',
  CAMERA: 'CAMERA',
  SENSOR: 'SENSOR',
  HARDWARE: 'HARDWARE',
  AI_SCAN: 'AI_SCAN'
};

const MessageRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM'
};

const ExpirationStatus = {
  EXPIRED: 'EXPIRED',
  CRITICAL: 'CRITICAL',
  SOON: 'SOON',
  SAFE: 'SAFE',
  NO_EXPIRATION: 'NO_EXPIRATION'
};

module.exports = {
  IngredientSource,
  MessageRole,
  ExpirationStatus
};
