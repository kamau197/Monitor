// statsRoutes.js - receive sync data and insert app / stats
import express from "express";
import query from "../db.js";

const router = express.Router();

/**
 * POST /api/sync-stats
 * body: { userId, appData }
 * appData: { package_name, title, revenue, installs, crash_rate }
 */
router.post("/sync-stats", async (req, res) => {
  try {
    const { userId, appData } = req.body;
    if (!userId || !appData || !appData.package_name) return res.status(400).json({ error: "userId and appData.package_name required" });

    // ensure app exists (insert or update)
    const rows = await query("SELECT id FROM apps WHERE package_name = ?", [appData.package_name]);
    let appId;
    if (!rows.length) {
      await query("INSERT INTO apps (user_id, package_name, title, last_sync) VALUES (?, ?, ?, NOW())", [userId, appData.package_name, appData.title || null]);
      const rr = await query("SELECT id FROM apps WHERE package_name = ?", [appData.package_name]);
      appId = rr[0].id;
    } else {
      appId = rows[0].id;
      await query("UPDATE apps SET last_sync = NOW(), title = ? WHERE id = ?", [appData.title || null, appId]);
    }

    // insert stats
    await query("INSERT INTO app_stats (user_id, package_name, revenue, installs, crash_rate) VALUES (?, ?, ?, ?, ?)", [
      userId,
      appData.package_name,
      appData.revenue || 0,
      appData.installs || 0,
      appData.crash_rate || 0
    ]);

    return res.json({ success: true, appId });
  } catch (err) {
    console.error("sync-stats err:", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
