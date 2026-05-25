import { createAuthMiddleware } from '@design-flow/shared';
import { config } from '../config.js';

export const authMiddleware = createAuthMiddleware(() => config.jwtSecret);
