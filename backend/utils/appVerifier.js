// backend/utils/appVerifier.js
import db from '../db.js';
import fetch from 'node-fetch';

/**
 * Checks if an app exists in the marketplace DB and fetches stats if found.
 * @param {string} packageName - The app's package name (com.example.app)
 * @returns {Promise<{exists: boolean, stats?: object, message: string}>}
 */
export async function verifyAndFetchApp(packageName) {
  try {
    // Check if the app exists in your marketplace's apps table
    const [rows] = await db.execute('SELECT * FROM apps WHERE package_name = ?', [packageName]);

    if (rows.length === 0) {
      console.warn(`[Verifier] App not found in DB: ${packageName}`);
      return { exists: false, message: 'App not registered in marketplace.' };
    }

    const app = rows[0];

    // Fetch latest stats from your API agent or Google Play API proxy
    const API_BASE = process.env.AGENT_API_BASE || 'https://your-agent-api.onrender.com';
    const response = await fetch(`${API_BASE}/stats/fetch?package=${packageName}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch stats for ${packageName}`);
    }

    const stats = await response.json();

    // Store or update stats in DB
    await db.execute(
      `INSERT INTO stats (user_id, app_id, revenue, crash_rate, installs)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         revenue = VALUES(revenue),
         crash_rate = VALUES(crash_rate),
         installs = VALUES(installs),
         recorded_at = CURRENT_TIMESTAMP`,
      [app.user_id, app.id, stats.revenue, stats.crashRate, stats.installs]
    );

    console.log(`[Verifier] Stats updated for ${packageName}`);
    return { exists: true, stats, message: 'App stats synced successfully.' };
  } catch (err) {
    console.error(`[Verifier Error] ${err.message}`);
    return { exists: false, message: err.message };
  }
}
