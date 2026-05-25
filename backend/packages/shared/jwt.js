import jwt from 'jsonwebtoken';

export function verifyToken(token, jwtSecret) {
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.verify(token, jwtSecret);
}

export function userFromPayload(payload) {
  return {
    id: payload.sub,
    username: payload.username,
    displayName: payload.displayName ?? null,
  };
}
