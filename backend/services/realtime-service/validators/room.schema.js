import { z } from 'zod';

export const roomIdPayloadSchema = z.object({
  roomId: z.string().uuid(),
});

export const leaveRoomPayloadSchema = z.object({
  roomId: z.string().uuid().optional(),
});
