// agent/utils/hash.js
import crypto from 'crypto';

export function hashValue(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}
