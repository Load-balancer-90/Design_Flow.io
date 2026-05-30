'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CreateRoomForm } from '@/components/lobby/CreateRoomForm';
import { JoinRoomForm } from '@/components/lobby/JoinRoomForm';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/auth.store';
import { useRoomStore } from '@/stores/room.store';

export default function LobbyPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const rooms = useRoomStore((s) => s.rooms);
  const getMyRooms = useRoomStore((s) => s.getMyRooms);

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user, router]);

  if (!user) return null;

  const myRooms = getMyRooms(user.id);

  return (
    <AppShell title="Lobby">
      <div className="animate-fade-up space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text)]">Lobby</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Create a new canvas room or join with a code. Demo data only.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-fade-up animate-delay-1">
            <h2 className="mb-4 text-lg font-medium text-[var(--text)]">
              Create room
            </h2>
            <CreateRoomForm />
          </Card>
          <Card className="animate-fade-up animate-delay-2">
            <h2 className="mb-4 text-lg font-medium text-[var(--text)]">
              Join room
            </h2>
            <JoinRoomForm />
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Demo codes: {rooms.slice(0, 2).map((r) => r.code).join(', ')}
            </p>
          </Card>
        </div>

        <section className="animate-fade-up animate-delay-3">
          <h2 className="mb-4 text-lg font-medium text-[var(--text)]">
            Your rooms
          </h2>
          {myRooms.length === 0 ? (
            <Card>
              <p className="text-sm text-[var(--text-muted)]">
                No rooms yet. Create one or join with a code.
              </p>
            </Card>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {myRooms.map((room, i) => (
                <li key={room.id}>
                  <Link
                    href={`/room/${room.id}`}
                    className="panel block p-4 transition-all duration-300 hover:border-[var(--accent)]/50 hover:shadow-[0_0_24px_var(--glow-soft)]"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <p className="font-medium text-[var(--text)]">{room.name}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--accent)]">
                      {room.code}
                    </p>
                    <p className="mt-2 text-xs text-[var(--text-muted)]">
                      {room.members.length} member
                      {room.members.length !== 1 ? 's' : ''}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
