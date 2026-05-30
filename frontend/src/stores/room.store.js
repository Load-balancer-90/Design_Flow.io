'use client';

import { create } from 'zustand';
import { DUMMY_ROOMS, findRoomById, generateRoomCode } from '@/lib/dummy/data';

export const useRoomStore = create((set, get) => ({
  rooms: [...DUMMY_ROOMS],

  createRoom({ name, hostUser }) {
    const room = {
      id: `room-${Date.now()}`,
      code: generateRoomCode(),
      name: name?.trim() || 'Untitled room',
      hostUserId: hostUser.id,
      members: [
        {
          userId: hostUser.id,
          username: hostUser.username,
          displayName: hostUser.displayName,
          role: 'host',
        },
      ],
    };
    set({ rooms: [...get().rooms, room] });
    return room;
  },

  joinRoomByCode(code, user) {
    const normalized = code.trim().toUpperCase();
    const room = get().rooms.find((r) => r.code === normalized);
    if (!room) return null;

    const exists = room.members.some((m) => m.userId === user.id);
    if (exists) return room;

    const updated = {
      ...room,
      members: [
        ...room.members,
        {
          userId: user.id,
          username: user.username,
          displayName: user.displayName,
          role: 'member',
        },
      ],
    };

    set({
      rooms: get().rooms.map((r) => (r.id === room.id ? updated : r)),
    });
    return updated;
  },

  leaveRoom(roomId, userId) {
    const room = findRoomById(roomId) ?? get().rooms.find((r) => r.id === roomId);
    if (!room) return;

    const members = room.members.filter((m) => m.userId !== userId);
    if (members.length === 0) {
      set({ rooms: get().rooms.filter((r) => r.id !== roomId) });
      return;
    }

    const updated = {
      ...room,
      members,
      hostUserId: members.some((m) => m.role === 'host')
        ? room.hostUserId
        : members[0].userId,
    };
    if (!members.some((m) => m.role === 'host')) {
      updated.members = members.map((m, i) =>
        i === 0 ? { ...m, role: 'host' } : m
      );
      updated.hostUserId = updated.members[0].userId;
    }

    set({
      rooms: get().rooms.map((r) => (r.id === roomId ? updated : r)),
    });
  },

  getRoom(roomId) {
    return get().rooms.find((r) => r.id === roomId) ?? findRoomById(roomId);
  },

  getMyRooms(userId) {
    return get().rooms.filter((r) =>
      r.members.some((m) => m.userId === userId)
    );
  },
}));
