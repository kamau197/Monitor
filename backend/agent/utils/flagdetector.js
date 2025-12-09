// agent/utils/flagDetector.js
import { sendToBackend } from './apiClient.js';

export async function detectFlags(config) {
  console.log('🚨 Running flag detector…');

  try {
    // Simulated flag detection logic — replace with API rules as needed
    const random = Math.random();
    if (random > 0.97) {
      const reason = 'Possible suspension or policy issue detected';
      await sendToBackend('/flags/report', {
        consoleId: config.consoleId,
        developerId: config.developerId,
        reason
      });
      console.log('⚠️ Flag reported to backend.');
    } else {
      console.log('✅ No flags detected this cycle.');
    }
  } catch (err) {
    console.error('Flag detector failed:', err.message);
  }
}
