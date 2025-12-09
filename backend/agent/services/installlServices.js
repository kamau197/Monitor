// agent/services/installService.js
import { sendToBackend } from '../utils/apiClient.js';

export async function checkInstallState(state = 'installed') {
  try {
    await sendToBackend('/install/state', { state });
    console.log(`📦 Installation state sent: ${state}`);
  } catch (err) {
    console.warn('⚠️ Could not send install state:', err.message);
  }
}
