// backend/routes/verifyRoutes.js
import express from 'express';
import { verifyAndFetchApp } from '../utils/appVerifier.js';

const router = express.Router();

// Verify and sync app by package name
router.get('/verify/:packageName', async (req, res) => {
  const { packageName } = req.params;
  const result = await verifyAndFetchApp(packageName);
  res.json(result);
});

export default router;
