// agent/services/syncService.js
import { getAppStats } from '../utils/googlePlay.js';
import { sendToBackend } from '../utils/apiClient.js';

export async function startSync(config) {
  console.log('⏱️ Starting background sync every 24 h.');

  const interval = 24 * 60 * 60 * 1000; // once per day
  await syncNow(config);
  setInterval(() => syncNow(config), interval);
}

async function syncNow(config) {
  try {
    console.log('🔄 Syncing app stats…');
    const stats = await getAppStats(config);
    if (stats) {
      await sendToBackend('/stats/upload', {
        consoleId: config.consoleId,
        developerId: config.developerId,
        stats
      });
      console.log('✅ Stats uploaded successfully.');
    }
  } catch (err) {
    console.error('❌ Sync failed:', err.message);
  }
}
