// stateRoutes.js - install/uninstall & email-state
import express from "express";
import query from "../db.js";

const router = express.Router();

/**
 * POST /api/update-state
 * body: { userId, state }  state = 'installed'|'uninstalled'
 */
router.post("/update-state", async (req, res) => {
  try {
    const { userId, state } = req.body;
    if (!userId || !state) return res.status(400).json({ error: "userId and state required" });
    await query("INSERT INTO install_logs (user_id, state) VALUES (?, ?)", [userId, state]);
    return res.json({ success: true });
  } catch (err) {
    console.error("update-state err:", err);
    return res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/email-state
 * body: { emailHash, active (bool), flagged (bool), reason (optional) }
 */
router.post("/email-state", async (req, res) => {
  try {
    const { emailHash, active = true, flagged = false, reason = null } = req.body;
    if (!emailHash) return res.status(400).json({ error: "emailHash required" });

    const rows = await query("SELECT id FROM email_states WHERE email_hash = ?", [emailHash]);
    if (rows.length) {
      await query("UPDATE email_states SET active = ?, flagged = ?, reason = ?, updated_at = NOW() WHERE email_hash = ?", [active, flagged, reason, emailHash]);
    } else {
      await query("INSERT INTO email_states (email_hash, active, flagged, reason) VALUES (?, ?, ?, ?)", [emailHash, active, flagged, reason]);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("email-state err:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
