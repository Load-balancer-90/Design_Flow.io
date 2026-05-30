'use client';

export function Input({ label, id, className = '', ...props }) {
  const inputId = id || props.name;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]"
        >
          {label}
        </label>
      )}
      <input id={inputId} className="input-field" {...props} />
    </div>
  );
}
