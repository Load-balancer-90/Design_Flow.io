import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes will use authMiddleware, e.g.:
// router.post('/', authMiddleware, createRoom);

export default router;
