import express from 'express';
import { config } from './config.js';
import { pool } from './db/db.js';

const app = express();

app.use(express.json());

app.get('/services/room/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'room-service', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'room-service', db: 'disconnected' });
  }
});

app.listen(config.port, () => {
  console.log(`room-service running on port ${config.port}`);
});
