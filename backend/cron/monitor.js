// backend/cron/monitorJob.js
import cron from 'node-cron';
import { pool } from '../db.js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

// Base URL for your deployed backend or agent endpoint
const AGENT_API = process.env.AGENT_API || 'https://your-agent-service.onrender.com';

async function runMonitor() {
  console.log('🕒 Running scheduled monitor job...');

  try {
    // 1. Fetch all registered consoles
    const [rows] = await pool.query('SELECT id, consoleId, developerId FROM consoles');

    for (const row of rows) {
      // 2. Call Agent API or simulated route for each console
      const res = await fetch(`${AGENT_API}/fetchStats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consoleId: row.consoleId,
          developerId: row.developerId
        })
      });

      const data = await res.json();

      // 3. Store returned stats
      await pool.query(
        'INSERT INTO stats (consoleId, developerId, installs, revenue, crashRate, lastSync) VALUES (?, ?, ?, ?, ?, NOW())',
        [row.consoleId, row.developerId, data.installs, data.revenue, data.crashRate]
      );

      console.log(`✅ Synced stats for ${row.consoleId}`);
    }

    console.log('🎯 Monitor job completed successfully.');
  } catch (err) {
    console.error('❌ Cron job failed:', err.message);
  }
}

// Schedule job to run every 12 hours
cron.schedule('0 */12 * * *', runMonitor, {
  scheduled: true,
  timezone: 'Africa/Nairobi'
});

export default runMonitor;
