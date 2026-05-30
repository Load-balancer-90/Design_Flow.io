'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Enter username and password.');
      return;
    }

    setAuth({
      id: `u-${Date.now()}`,
      username: username.trim(),
      displayName: username.trim(),
    });
    router.push('/lobby');
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your design workspace (demo mode)"
    >
      <Card>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input
            label="Username"
            name="username"
            placeholder="alice"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          {error && (
            <p className="text-sm text-red-400 animate-fade-in">{error}</p>
          )}
          <Button type="submit" className="w-full mt-1">
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          No account?{' '}
          <Link
            href="/signup"
            className="text-[var(--accent)] transition-colors hover:underline"
          >
            Create one
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
