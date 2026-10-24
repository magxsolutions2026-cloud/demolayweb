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
      className={`group relative rounded-lg p-2 transition duration-200 ease-out hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold/40 ${
        destructive
          ? 'text-rose-300/90 hover:bg-rose-500/15 hover:text-rose-200'
          : 'text-sky-300/90 hover:bg-sky-500/15 hover:text-sky-200'
      } ${className}`}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 rounded-md border border-white/10 bg-[#1a1624] px-2 py-1 text-[10px] font-medium text-foreground/90 shadow-md sm:group-hover:block">
        {label}
      </span>
    </button>
  );
}
