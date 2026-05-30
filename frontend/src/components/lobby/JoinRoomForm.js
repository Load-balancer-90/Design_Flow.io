'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';
import { useRoomStore } from '@/stores/room.store';

export function JoinRoomForm() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const joinRoomByCode = useRoomStore((s) => s.joinRoomByCode);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!user) return;
    if (code.trim().length < 4) {
      setError('Enter a valid room code.');
      return;
    }

    const room = joinRoomByCode(code, user);
    if (!room) {
      setError('Room not found. Try DFLOW01A (demo).');
      return;
    }

    router.push(`/room/${room.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Room code"
        name="code"
        placeholder="DFLOW01A"
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        className="uppercase tracking-widest"
      />
      {error && <p className="text-sm text-red-400 animate-fade-in">{error}</p>}
      <Button type="submit" variant="secondary" className="w-full sm:w-auto">
        Join room
      </Button>
    </form>
  );
}
