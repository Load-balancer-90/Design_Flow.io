import {
  addRoomMember,
  createRoomWithHost,
  findCanvasSnapshot,
  findRoomByCode,
  findRoomById,
  generateUniqueRoomCode,
  isRoomMember,
} from '../db/queries.js';
import { buildRoomResponse, toPublicSnapshot } from '../utils/room.format.js';

export async function createRoom(req, res) {
  const { name } = req.body;
  const code = await generateUniqueRoomCode();
  const room = await createRoomWithHost({
    name,
    hostUserId: req.user.id,
    code,
  });

  res.status(201).json(await buildRoomResponse(room.id));
}

export async function getRoom(req, res) {
  const { roomId } = req.params;

  const room = await findRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const member = await isRoomMember(roomId, req.user.id);
  if (!member) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(await buildRoomResponse(roomId));
}

export async function joinRoom(req, res) {
  const { code } = req.body;

  const room = await findRoomByCode(code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  await addRoomMember({ roomId: room.id, userId: req.user.id });
  res.json(await buildRoomResponse(room.id));
}

export async function getCanvas(req, res) {
  const { roomId } = req.params;

  const room = await findRoomById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (!(await isRoomMember(roomId, req.user.id))) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const snapshot = await findCanvasSnapshot(roomId);
  if (!snapshot) {
    return res.status(404).json({ error: 'Snapshot not found' });
  }

  res.json(toPublicSnapshot(snapshot));
}
