// consoleRoutes.js - register-console & fetch-keys
import express from "express";
import query from "../db.js";
import { encryptObject } from "../utils/encrypt.js";
import { hashEmail } from "../utils/hash.js";

const router = express.Router();

/**
 * POST /api/register-console
 * body: { consoleId, developerId, googlePlayKey (string JSON), reportKey, publishingKey, email }
 * Stores developer record and encrypted keys
 */
router.post("/register-console", async (req, res) => {
  try {
    const { consoleId, developerId, googlePlayKey, reportKey, publishingKey, email } = req.body;
    if (!developerId) return res.status(400).json({ error: "developerId required" });

    // upsert developer
    await query(
      `INSERT INTO developers (user_id, email, hashed_email, console_id, developer_id)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email), hashed_email = VALUES(hashed_email), console_id = VALUES(console_id), developer_id = VALUES(developer_id)`,
      [developerId, email || null, email ? hashEmail(email) : null, consoleId || null, developerId]
    );

    const encrypted = encryptObject({ googlePlayKey, reportKey, publishingKey });

    await query(
      `INSERT INTO api_keys (user_id, encrypted) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE encrypted = VALUES(encrypted)`,
      [developerId, encrypted]
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("register-console err:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/fetch-keys
 * body: { userId }
 * Returns: { encrypted }
 * Agent calls this to retrieve encrypted key blob (then decrypt locally)
 */
router.post("/fetch-keys", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId required" });

    const rows = await query("SELECT encrypted FROM api_keys WHERE user_id = ?", [userId]);
    if (!rows.length) return res.status(404).json({ error: "No keys found for user" });

    return res.json({ encrypted: rows[0].encrypted });
  } catch (err) {
    console.error("fetch-keys err:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
