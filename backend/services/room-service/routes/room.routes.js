import { Router } from 'express';
import {
  createRoom,
  getCanvas,
  getRoom,
  joinRoom,
} from '../controllers/room.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate, validateParams } from '../middleware/validate.js';
import {
  createRoomSchema,
  joinRoomSchema,
  roomIdParamSchema,
} from '../validators/room.schema.js';

const router = Router();

router.post('/create', authMiddleware, validate(createRoomSchema), createRoom);
router.post('/join', authMiddleware, validate(joinRoomSchema), joinRoom);
router.get('/:roomId/canvas',authMiddleware,validateParams(roomIdParamSchema),getCanvas);
router.get('/:roomId',authMiddleware,validateParams(roomIdParamSchema),getRoom);

export default router;
