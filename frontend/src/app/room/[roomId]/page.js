'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { Canvas } from '@/components/room/Canvas';
import { MembersList } from '@/components/room/MembersList';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth.store';
import { useRoomStore } from '@/stores/room.store';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId;
  const user = useAuthStore((s) => s.user);
  const getRoom = useRoomStore((s) => s.getRoom);
  const leaveRoom = useRoomStore((s) => s.leaveRoom);
  const [copied, setCopied] = useState(false);

  const room = getRoom(roomId);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  useEffect(() => {
    if (user && roomId && !getRoom(roomId)) {
      router.replace('/lobby');
    }
  }, [user, roomId, getRoom, router]);

  if (!user || !room) return null;

  const isMember = room.members.some((m) => m.userId === user.id);

  function handleLeave() {
    leaveRoom(room.id, user.id);
    router.push('/lobby');
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isMember) {
    return (
      <AppShell>
        <Card className="animate-fade-up max-w-md mx-auto text-center">
          <p className="text-[var(--text-muted)]">
            You are not a member of this room.
          </p>
          <Link href="/lobby" className="mt-4 inline-block">
            <Button variant="secondary">Back to lobby</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title={room.name}>
      <div className="animate-fade-up space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--text)]">
              {room.name}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleCopyCode}
                className="font-mono text-sm text-[var(--accent)] transition-all hover:opacity-80"
              >
                {room.code}
                {copied && (
                  <span className="ml-2 text-xs text-[var(--text-muted)]">
                    Copied!
                  </span>
                )}
              </button>
              <span className="text-xs text-[var(--text-muted)]">
                {room.members.length} online (demo)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/lobby">
              <Button variant="secondary">Lobby</Button>
            </Link>
            <Button variant="danger" onClick={handleLeave}>
              Leave room
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="animate-fade-up animate-delay-1 min-w-0">
            <Canvas />
          </div>
          <Card className="animate-fade-up animate-delay-2 h-fit">
            <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Members
            </h2>
            <MembersList members={room.members} />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
