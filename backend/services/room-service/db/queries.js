import crypto from 'crypto';
import { pool, query } from './db.js';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 8;

function randomCode() {
  let code = '';
  const bytes = crypto.randomBytes(CODE_LENGTH);
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_CHARS[bytes[i] % CODE_CHARS.length];
  }
  return code;
}

export async function codeExists(code) {
  const result = await query('SELECT 1 FROM rooms WHERE code = $1', [code]);
  return result.rowCount > 0;
}

export async function generateUniqueRoomCode(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomCode();
    if (!(await codeExists(code))) {
      return code;
    }
  }
  throw new Error('Failed to generate unique room code');
}

export async function createRoomWithHost({ name, hostUserId, code }) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const roomResult = await client.query(
      `INSERT INTO rooms (code, name, host_user_id)
       VALUES ($1, $2, $3)
       RETURNING id, code, name, host_user_id, created_at, updated_at`,
      [code, name ?? null, hostUserId]
    );
    const room = roomResult.rows[0];

    await client.query(
      `INSERT INTO room_members (room_id, user_id, role)
       VALUES ($1, $2, 'host')`,
      [room.id, hostUserId]
    );

    await client.query(
      `INSERT INTO canvas_snapshots (room_id, snapshot, saved_by)
       VALUES ($1, '{"nodes":[],"edges":[]}', $2)`,
      [room.id, hostUserId]
    );

    await client.query('COMMIT');
    return room;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function findRoomById(roomId) {
  const result = await query(
    `SELECT id, code, name, host_user_id, created_at, updated_at
     FROM rooms WHERE id = $1`,
    [roomId]
  );
  return result.rows[0] ?? null;
}

export async function findRoomByCode(code) {
  const result = await query(
    `SELECT id, code, name, host_user_id, created_at, updated_at
     FROM rooms WHERE code = $1`,
    [code]
  );
  return result.rows[0] ?? null;
}

export async function addRoomMember({ roomId, userId, role = 'member' }) {
  await query(
    `INSERT INTO room_members (room_id, user_id, role)
     VALUES ($1, $2, $3)
     ON CONFLICT (room_id, user_id) DO NOTHING`,
    [roomId, userId, role]
  );
}

export async function findCanvasSnapshot(roomId) {
  const result = await query(
    `SELECT snapshot, saved_at, saved_by
     FROM canvas_snapshots WHERE room_id = $1`,
    [roomId]
  );
  return result.rows[0] ?? null;
}

export async function isRoomMember(roomId, userId) {
  const result = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
  return result.rowCount > 0;
}

export async function findMembersWithUsers(roomId) {
  const result = await query(
    `SELECT rm.user_id, rm.role, rm.joined_at, u.username, u.display_name
     FROM room_members rm
     JOIN users u ON u.id = rm.user_id
     WHERE rm.room_id = $1
     ORDER BY rm.joined_at ASC`,
    [roomId]
  );
  return result.rows;
}
