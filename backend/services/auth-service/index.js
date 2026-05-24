import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import { pool } from './db/db.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'auth-service', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', service: 'auth-service', db: 'disconnected' });
  }
});

app.use('/auth', authRoutes);

app.listen(config.port, () => {
  console.log(`auth-service running on port ${config.port}`);
});
