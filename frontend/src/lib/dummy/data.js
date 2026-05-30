export const DUMMY_USERS = [
  { id: 'u1', username: 'alice', displayName: 'Alice Chen' },
  { id: 'u2', username: 'bob', displayName: 'Bob Rivera' },
];

export const DUMMY_ROOMS = [
  {
    id: 'room-1',
    code: 'DFLOW01A',
    name: 'API Gateway Design',
    hostUserId: 'u1',
    members: [
      { userId: 'u1', username: 'alice', displayName: 'Alice Chen', role: 'host' },
      { userId: 'u2', username: 'bob', displayName: 'Bob Rivera', role: 'member' },
    ],
  },
  {
    id: 'room-2',
    code: 'DFLOW02B',
    name: 'Auth Flow Sketch',
    hostUserId: 'u2',
    members: [
      { userId: 'u2', username: 'bob', displayName: 'Bob Rivera', role: 'host' },
    ],
  },
];

export function findRoomByCode(code) {
  const normalized = code.trim().toUpperCase();
  return DUMMY_ROOMS.find((r) => r.code === normalized) ?? null;
}

export function findRoomById(roomId) {
  return DUMMY_ROOMS.find((r) => r.id === roomId) ?? null;
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
