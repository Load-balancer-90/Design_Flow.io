'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { useRoomStore } from '@/stores/room.store';

export function CreateRoomForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const createRoom = useRoomStore((s) => s.createRoom);
  const [name, setName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;

    const room = createRoom({ name, hostUser: user });
    router.push(`/room/${room.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Room name"
        name="roomName"
        placeholder="e.g. Payment service architecture"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit" className="w-full sm:w-auto">
        Create room
      </Button>
    </form>
  );
}
