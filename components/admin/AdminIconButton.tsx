'use client';

export function AdminIconButton({
  label,
  children,
  className = '',
  destructive,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string; destructive?: boolean }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`cs-icon-btn !h-8 !w-8 ${destructive ? 'hover:!text-[var(--cs-red)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
