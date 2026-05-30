export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-10 animate-fade-in text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
          Design_Flow.io
        </p>
        <h1 className="text-2xl font-semibold text-[var(--text)]">{title}</h1>
        {subtitle && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">{subtitle}</p>
        )}
      </div>
      <div className="w-full max-w-md animate-fade-up">{children}</div>
    </div>
  );
}
