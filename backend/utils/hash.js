// hash.js - email hashing helper
import crypto from "crypto";

export function hashEmail(email) {
  if (!email) return null;
  return crypto.createHash("sha256").update(String(email).trim().toLowerCase()).digest("hex");
}
