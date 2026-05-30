'use client';

export function MembersList({ members }) {
  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li
          key={member.userId}
          className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 transition-all duration-200 hover:border-[var(--accent-dim)]/40"
        >
          <div>
            <p className="text-sm font-medium text-[var(--text)]">
              {member.displayName || member.username}
            </p>
            <p className="text-xs text-[var(--text-muted)]">@{member.username}</p>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              member.role === 'host'
                ? 'bg-[var(--glow-soft)] text-[var(--accent)]'
                : 'text-[var(--text-muted)]'
            }`}
          >
            {member.role}
          </span>
        </li>
      ))}
    </ul>
  );
}
