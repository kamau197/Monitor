// agent/utils/apiClient.js
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_BASE || 'https://your-api-domain.onrender.com/api';

export async function sendToBackend(endpoint, data) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return res.json().catch(() => ({}));
}
