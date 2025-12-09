// agent/agent.js
import { ensureConfig } from './configStore.js';
import { runFirstPrompt } from './firstRunPrompt.js';
import { startSync } from './services/syncService.js';
import { checkInstallState } from './services/installService.js';
import { detectFlags } from './utils/flagDetector.js';
import dotenv from 'dotenv';

dotenv.config();

(async () => {
  console.log('🔧 App Monitor Agent starting up...');

  const config = await ensureConfig();

  if (!config.initialized) {
    await runFirstPrompt();
  }

  // Log installation state
  await checkInstallState('installed');

  // Start periodic sync loop
  await startSync(config);

  // Run flag detector periodically (every 6 h)
  setInterval(async () => {
    await detectFlags(config);
  }, 6 * 60 * 60 * 1000);
})();
