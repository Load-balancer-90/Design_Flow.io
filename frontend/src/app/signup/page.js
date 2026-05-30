'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/stores/auth.store';

export default function SignupPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim() || username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setAuth({
      id: `u-${Date.now()}`,
      username: username.trim(),
      displayName: displayName.trim() || username.trim(),
    });
    router.push('/lobby');
  }

  return (
    <AuthShell
      title="Create account"
      subtitle="Start collaborating on system designs (demo mode)"
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
            label="Display name"
            name="displayName"
            placeholder="Alice Chen (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          {error && (
            <p className="text-sm text-red-400 animate-fade-in">{error}</p>
          )}
          <Button type="submit" className="w-full mt-1">
            Sign up
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-[var(--accent)] transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
