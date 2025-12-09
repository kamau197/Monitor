// agent/firstRunPrompt.js
import inquirer from 'inquirer';
import fs from 'fs-extra';
import path from 'path';
import fetch from 'node-fetch';
import { hashValue } from './utils/hash.js';

const CONFIG_PATH = path.resolve('./agent-config.json');

export async function runFirstPrompt() {
  console.log('\n🚀 Welcome to App Monitor Installer\n');

  const answers = await inquirer.prompt([
    { name: 'consoleId', message: 'Enter your Google Console ID:' },
    { name: 'developerId', message: 'Enter your Developer ID:' },
    { name: 'googleApiKey', message: 'Paste your Google Play API Key:' },
    { name: 'email', message: 'Enter your developer email:' }
  ]);

  const emailHash = hashValue(answers.email);

  const config = {
    consoleId: answers.consoleId,
    developerId: answers.developerId,
    googleApiKey: answers.googleApiKey,
    emailHash,
    initialized: true
  };

  await fs.writeJson(CONFIG_PATH, config, { spaces: 2 });
  console.log('✅ Configuration saved locally.');

  // Send to backend
  try {
    const API_BASE = process.env.API_BASE || 'https://your-api-domain.onrender.com/api';
    const res = await fetch(`${API_BASE}/console/install`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (res.ok) console.log('📡 Installation registered with backend.');
  } catch {
    console.warn('⚠️ Could not notify backend (offline). Will retry later.');
  }
}
