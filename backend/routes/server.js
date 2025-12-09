// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fetch from 'node-fetch';
import { pool } from './db.js';

// Import routes
import consoleRoutes from './routes/consoleRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import flagRoutes from './routes/flagRoutes.js';
import stateRoutes from './routes/stateRoutes.js';

// Import cron job
import cron from 'node-cron';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ROUTES
app.use('/api/consoles', consoleRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/flags', flagRoutes);
app.use('/api/state', stateRoutes);

const PORT = process.env.PORT || 5000;
const AGENT_API = process.env.AGENT_API || 'https://your-agent-service.onrender.com';


// 🧠 Helper: flag detector logic
async function detectFlags(data, consoleId, developerId) {
  if (!data) return;

  const { installs, crashRate, revenue, banned } = data;
  const issues = [];

  if (crashRate > 10) issues.push('High crash rate');
  if (revenue === 0 && installs > 100) issues.push('Possible payment issue');
  if (banned) issues.push('App flagged or banned from console');

  for (const reason of issues) {
    await pool.query(
      'INSERT INTO flags (consoleId, developerId, reason, detectedAt) VALUES (?, ?, ?, NOW())',
      [consoleId, developerId, reason]
    );
    console.log(`🚩 Flag logged for ${consoleId}: ${reason}`);
  }
}


// 🕒 CRON JOB — run every 12 hours to refresh all data
async function runMonitor() {
  console.log('🕒 Running scheduled monitor job...');

  try {
    // 1️⃣ Get all active console links
    const [rows] = await pool.query('SELECT id, consoleId, developerId FROM consoles');

    for (const row of rows) {
      try {
        // 2️⃣ Call Agent API for new stats
        const res = await fetch(`${AGENT_API}/fetchStats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consoleId: row.consoleId,
            developerId: row.developerId
          })
        });

        if (!res.ok) throw new Error(`Agent fetch failed for ${row.consoleId}`);

        const data = await res.json();

        // 3️⃣ Store returned stats
        await pool.query(
          `INSERT INTO stats (consoleId, developerId, installs, revenue, crashRate, lastSync)
           VALUES (?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE installs=?, revenue=?, crashRate=?, lastSync=NOW()`,
          [
            row.consoleId,
            row.developerId,
            data.installs,
            data.revenue,
            data.crashRate,
            data.installs,
            data.revenue,
            data.crashRate
          ]
        );

        // 4️⃣ Run flag detector
        await detectFlags(data, row.consoleId, row.developerId);

        console.log(`✅ Synced & checked ${row.consoleId}`);
      } catch (innerErr) {
        console.error(`❌ Failed syncing ${row.consoleId}:`, innerErr.message);
      }
    }

    console.log('🎯 Monitor job completed successfully.');
  } catch (err) {
    console.error('❌ Cron job failed:', err.message);
  }
}

// Schedule job for every 12 hours (midnight + noon)
cron.schedule('0 */12 * * *', runMonitor, {
  scheduled: true,
  timezone: 'Africa/Nairobi'
});


// 🔌 Health check endpoint
app.get('/', (req, res) => {
  res.send('✅ App-Monitor backend is running.');
});


// 🟢 Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  runMonitor(); // optional: first run on startup
});
