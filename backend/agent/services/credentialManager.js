// agent/services/credentialManager.js
import fs from 'fs-extra';
import CryptoJS from 'crypto-js';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const CONFIG_PATH = path.resolve('./agent-config.json');
const SECRET = process.env.ENCRYPT_KEY || 'default32charsecretkeyexample123456';

export async function getDecryptedKey() {
  const config = await fs.readJson(CONFIG_PATH);
  const bytes = CryptoJS.AES.decrypt(config.googleApiKey, SECRET);
  return bytes.toString(CryptoJS.enc.Utf8) || config.googleApiKey;
}
