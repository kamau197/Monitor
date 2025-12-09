// encrypt.js - AES-256-CBC encrypt/decrypt helpers
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ALGO = "aes-256-cbc";
const KEY = Buffer.from(process.env.ENCRYPT_KEY, "utf8"); // must be 32 bytes

if (!process.env.ENCRYPT_KEY || KEY.length !== 32) {
  console.warn("⚠️ ENCRYPT_KEY not set or not 32 bytes. Set a 32-character secret in .env for production.");
}

export function encryptObject(obj) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const plaintext = JSON.stringify(obj);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

export function decryptString(encrypted) {
  const parts = encrypted.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  const decoded = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return JSON.parse(decoded.toString("utf8"));
}
