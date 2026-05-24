import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import {
  createUser,
  findUserById,
  findUserByUsername,
} from '../db/queries.js';

function toPublicUser(row) {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name ?? null,
    createdAt: row.created_at,
  };
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username,
      displayName: user.display_name ?? null,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

export async function signup(req, res) {
  const { username, password, displayName } = req.body;

  const existing = await findUserByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);
  const user = await createUser({ username, passwordHash, displayName });

  res.status(201).json({
    accessToken: signToken(user),
    user: toPublicUser(user),
  });
}

export async function login(req, res) {
  const { username, password } = req.body;

  const user = await findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  res.json({
    accessToken: signToken(user),
    user: toPublicUser(user),
  });
}

export async function me(req, res) {
  const user = await findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user: toPublicUser(user) });
}
