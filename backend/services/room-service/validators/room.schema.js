import { z } from 'zod';

const ROOM_CODE_REGEX = /^[A-Z2-9]{8}$/;

export const createRoomSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
});

export const joinRoomSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .length(8)
    .regex(ROOM_CODE_REGEX, 'Invalid room code'),
});

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid(),
});
