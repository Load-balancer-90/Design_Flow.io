'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';

export function AppShell({ children, title }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg-deep)]/90 backdrop-blur-md animate-fade-in">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link
            href="/lobby"
            className="text-sm font-semibold tracking-tight text-[var(--text)] transition-colors hover:text-[var(--accent)]"
          >
            Design_Flow.io
          </Link>
          <div className="flex items-center gap-4">
            {title && (
              <span className="hidden text-sm text-[var(--text-muted)] sm:inline">
                {title}
              </span>
            )}
            {user && (
              <span className="text-sm text-[var(--text-muted)]">
                {user.displayName || user.username}
              </span>
            )}
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
