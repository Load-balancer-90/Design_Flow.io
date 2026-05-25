import { findMembersWithUsers, findRoomById } from '../db/queries.js';

export function toPublicRoom(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name ?? null,
    hostUserId: row.host_user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toPublicMember(row) {
  return {
    userId: row.user_id,
    username: row.username,
    displayName: row.display_name ?? null,
    role: row.role,
    joinedAt: row.joined_at,
  };
}

export async function buildRoomResponse(roomId) {
  const room = await findRoomById(roomId);
  const members = await findMembersWithUsers(roomId);
  return {
    room: toPublicRoom(room),
    members: members.map(toPublicMember),
  };
}

export function toPublicSnapshot(row) {
  const snapshot = row.snapshot ?? { nodes: [], edges: [] };
  return {
    snapshot: {
      nodes: snapshot.nodes ?? [],
      edges: snapshot.edges ?? [],
    },
    savedAt: row.saved_at,
    savedBy: row.saved_by,
  };
}
