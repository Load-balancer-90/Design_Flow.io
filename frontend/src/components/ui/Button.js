'use client';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) {
  const base =
    'btn-glow inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-white text-[#0a0a0b] hover:bg-zinc-100 shadow-[0_0_20px_var(--glow-soft)]',
    secondary:
      'bg-[var(--bg-elevated)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent-dim)]',
    ghost:
      'bg-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]',
    danger:
      'bg-[var(--bg-elevated)] text-red-400 border border-red-900/50 hover:border-red-500/50',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
