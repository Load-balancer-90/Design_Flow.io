import { isRoomMember } from '../db/queries.js';
import { SOCKET_EVENTS } from '../socket/events.js';
import {
  leaveRoomPayloadSchema,
  roomIdPayloadSchema,
} from '../validators/room.schema.js';

function roomChannel(roomId) {
  return `room:${roomId}`;
}

function publicUser(socket) {
  return {
    userId: socket.data.user.id,
    username: socket.data.user.username,
    displayName: socket.data.user.displayName,
  };
}

function emitRoomError(socket, message, ack) {
  const payload = { error: message };
  if (typeof ack === 'function') {
    ack(payload);
    return;
  }
  socket.emit(SOCKET_EVENTS.ROOM_ERROR, payload);
}

async function leaveCurrentRoom(socket) {
  const roomId = socket.data.roomId;
  if (!roomId) {
    return;
  }

  const channel = roomChannel(roomId);
  await socket.leave(channel);
  delete socket.data.roomId;

  socket.to(channel).emit(SOCKET_EVENTS.USER_LEFT, {
    roomId,
    user: publicUser(socket),
  });
}

export function registerRoomHandlers(io) {
  io.on('connection', (socket) => {
    socket.on(SOCKET_EVENTS.JOIN_ROOM, async (payload, ack) => {
      const parsed = roomIdPayloadSchema.safeParse(payload);
      if (!parsed.success) {
        emitRoomError(socket, 'Invalid room id', ack);
        return;
      }

      const { roomId } = parsed.data;

      try {
        const member = await isRoomMember(roomId, socket.data.user.id);
        if (!member) {
          emitRoomError(socket, 'Forbidden', ack);
          return;
        }

        if (socket.data.roomId && socket.data.roomId !== roomId) {
          await leaveCurrentRoom(socket);
        }

        if (socket.data.roomId === roomId) {
          const ok = { roomId };
          if (typeof ack === 'function') {
            ack(null, ok);
          } else {
            socket.emit(SOCKET_EVENTS.ROOM_JOINED, ok);
          }
          return;
        }

        const channel = roomChannel(roomId);
        await socket.join(channel);
        socket.data.roomId = roomId;

        socket.to(channel).emit(SOCKET_EVENTS.USER_JOINED, {
          roomId,
          user: publicUser(socket),
        });

        const ok = { roomId };
        if (typeof ack === 'function') {
          ack(null, ok);
        } else {
          socket.emit(SOCKET_EVENTS.ROOM_JOINED, ok);
        }
      } catch {
        emitRoomError(socket, 'Failed to join room', ack);
      }
    });

    socket.on(SOCKET_EVENTS.LEAVE_ROOM, async (payload, ack) => {
      const parsed = leaveRoomPayloadSchema.safeParse(payload ?? {});
      if (!parsed.success) {
        emitRoomError(socket, 'Invalid room id', ack);
        return;
      }

      const roomId = parsed.data.roomId ?? socket.data.roomId;
      if (!roomId) {
        if (typeof ack === 'function') {
          ack(null, {});
        }
        return;
      }

      if (socket.data.roomId !== roomId) {
        emitRoomError(socket, 'Not in this room', ack);
        return;
      }

      try {
        await leaveCurrentRoom(socket);
        const ok = { roomId };
        if (typeof ack === 'function') {
          ack(null, ok);
        }
      } catch {
        emitRoomError(socket, 'Failed to leave room', ack);
      }
    });

    socket.on('disconnect', () => {
      void leaveCurrentRoom(socket);
    });
  });
}
