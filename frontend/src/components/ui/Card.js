export function Card({ children, className = '' }) {
  return (
    <div
      className={`panel p-6 transition-all duration-300 hover:border-[var(--accent-dim)]/30 ${className}`}
    >
      {children}
    </div>
  );
}
