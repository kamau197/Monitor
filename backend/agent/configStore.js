// agent/configStore.js
import fs from 'fs-extra';
import path from 'path';

const CONFIG_PATH = path.resolve('./agent-config.json');

export async function ensureConfig() {
  if (!await fs.pathExists(CONFIG_PATH)) {
    await fs.writeJson(CONFIG_PATH, { initialized: false });
    return { initialized: false };
  }
  return fs.readJson(CONFIG_PATH);
}
