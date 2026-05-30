'use client';

export function Canvas() {
  const nodes = [
    { id: '1', label: 'Client', x: '12%', y: '20%' },
    { id: '2', label: 'API Gateway', x: '42%', y: '20%' },
    { id: '3', label: 'Auth Service', x: '72%', y: '20%' },
    { id: '4', label: 'Room Service', x: '27%', y: '55%' },
    { id: '5', label: 'Realtime', x: '57%', y: '55%' },
    { id: '6', label: 'Postgres', x: '42%', y: '78%' },
  ];

  return (
    <div className="relative h-[min(520px,60vh)] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle, var(--border) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <p className="absolute left-4 top-4 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Canvas preview (dummy)
      </p>
      {nodes.map((node, i) => (
        <div
          key={node.id}
          className="absolute rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] px-4 py-3 text-sm font-medium text-[var(--text)] shadow-[0_0_16px_var(--glow-soft)] transition-all duration-300 hover:border-[var(--accent)] hover:shadow-[0_0_24px_var(--glow)]"
          style={{
            left: node.x,
            top: node.y,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.08}s`,
          }}
        >
          {node.label}
        </div>
      ))}
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        <line
          x1="20%"
          y1="28%"
          x2="38%"
          y2="28%"
          stroke="var(--accent-dim)"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        <line
          x1="48%"
          y1="28%"
          x2="68%"
          y2="28%"
          stroke="var(--accent-dim)"
          strokeOpacity="0.5"
          strokeWidth="2"
        />
        <line
          x1="42%"
          y1="32%"
          x2="32%"
          y2="50%"
          stroke="var(--accent-dim)"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <line
          x1="48%"
          y1="32%"
          x2="55%"
          y2="50%"
          stroke="var(--accent-dim)"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
        <line
          x1="42%"
          y1="62%"
          x2="42%"
          y2="72%"
          stroke="var(--accent-dim)"
          strokeOpacity="0.35"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
