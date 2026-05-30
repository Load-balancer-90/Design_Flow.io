import { query } from './db.js';

export async function isRoomMember(roomId, userId) {
  const result = await query(
    `SELECT 1 FROM room_members WHERE room_id = $1 AND user_id = $2`,
    [roomId, userId]
  );
  return result.rowCount > 0;
}
