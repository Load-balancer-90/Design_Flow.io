import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config.js';
import { pool } from './db/db.js';
import { registerRoomHandlers } from './handlers/room.handler.js';
import { socketAuth } from './middleware/socketAuth.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  path: '/socket.io',
  cors: { origin: '*' },
});

// TODO: Redis adapter for multi-instance broadcast
// import { createAdapter } from '@socket.io/redis-adapter';
// import Redis from 'ioredis';
// const pub = new Redis(config.redisUrl);
// const sub = pub.duplicate();
// io.adapter(createAdapter(pub, sub));

io.use(socketAuth);
registerRoomHandlers(io);

app.get('/services/realtime/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'realtime-service', db: 'connected' });
  } catch {
    res.status(503).json({
      status: 'error',
      service: 'realtime-service',
      db: 'disconnected',
    });
  }
});

httpServer.listen(config.port, () => {
  console.log(`realtime-service running on port ${config.port}`);
});
