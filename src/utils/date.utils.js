const { ExpirationStatus } = require('../constants/enums');

function getDaysUntilExpiry(date) {
  if (!date) return null;
  const now = new Date();
  const expiry = new Date(date);
  const diffTime = expiry.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getExpirationStatus(date) {
  if (!date) return ExpirationStatus.NO_EXPIRATION;
  const days = getDaysUntilExpiry(date);
  if (days <= 0) return ExpirationStatus.EXPIRED;
  if (days === 1) return ExpirationStatus.CRITICAL;
  if (days >= 2 && days <= 7) return ExpirationStatus.SOON;
  return ExpirationStatus.SAFE;
}

function getExpirationWeight(date) {
  if (!date) return 0.1;
  const days = getDaysUntilExpiry(date);
  if (days <= 0) return 0.0;
  if (days === 1) return 1.0;
  if (days >= 2 && days <= 3) return 0.8;
  if (days >= 4 && days <= 7) return 0.5;
  return 0.2;
}

module.exports = {
  getDaysUntilExpiry,
  getExpirationStatus,
  getExpirationWeight
};
