import { userFromPayload, verifyToken } from '@design-flow/shared';
import { config } from '../config.js';

export function socketAuth(socket, next) {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== 'string') {
    return next(new Error('Unauthorized'));
  }

  try {
    const payload = verifyToken(token, config.jwtSecret);
    socket.data.user = userFromPayload(payload);
    next();
  } catch {
    next(new Error('Unauthorized'));
  }
}
