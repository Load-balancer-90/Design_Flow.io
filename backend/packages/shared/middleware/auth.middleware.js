import { userFromPayload, verifyToken } from '../jwt.js';

export function createAuthMiddleware(getJwtSecret) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const token = header.slice(7);
      const jwtSecret =
        typeof getJwtSecret === 'function' ? getJwtSecret() : getJwtSecret;
      const payload = verifyToken(token, jwtSecret);
      req.user = userFromPayload(payload);
      next();
    } catch {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  };
}
