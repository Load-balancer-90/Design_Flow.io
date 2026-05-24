import { query } from './db.js';

export async function findUserByUsername(username) {
  const result = await query(
    `SELECT id, username, password_hash, display_name, created_at
     FROM users WHERE username = $1`,
    [username]
  );
  return result.rows[0] ?? null;
}

export async function findUserById(id) {
  const result = await query(
    `SELECT id, username, display_name, created_at
     FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function createUser({ username, passwordHash, displayName }) {
  const result = await query(
    `INSERT INTO users (username, password_hash, display_name)
     VALUES ($1, $2, $3)
     RETURNING id, username, display_name, created_at`,
    [username, passwordHash, displayName ?? null]
  );
  return result.rows[0];
}
