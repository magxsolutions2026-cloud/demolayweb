'use client';

import { Loader2 } from 'lucide-react';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold tracking-tight transition duration-200 ease-out focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0a10] disabled:pointer-events-none disabled:opacity-45';

export function AdminPrimaryButton({
  children,
  className = '',
  variant = 'primary',
  loading,
  type = 'button',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'danger';
  loading?: boolean;
}) {
  const v =
    variant === 'danger'
      ? 'border border-rose-500/50 bg-gradient-to-br from-rose-600 to-rose-900 text-white shadow-lg shadow-rose-900/30 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]'
      : 'border border-gold/45 text-[#0a0810] shadow-lg shadow-black/25 hover:scale-[1.02] active:scale-[0.98] admin-btn-primary';

  return (
    <button type={type} className={`${base} ${v} ${className}`} disabled={loading || disabled} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function AdminGhostButton({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`${base} border border-white/15 bg-white/5 text-foreground/90 hover:border-gold/35 hover:bg-gold/10 hover:text-gold active:scale-[0.98] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
