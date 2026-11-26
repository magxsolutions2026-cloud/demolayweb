'use client';

import { Loader2 } from 'lucide-react';

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
  return (
    <button
      type={type}
      className={`cs-btn ${variant === 'danger' ? 'cs-btn-danger' : 'cs-btn-primary'} ${className}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : null}
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
    <button type="button" className={`cs-btn cs-btn-ghost ${className}`} {...props}>
      {children}
    </button>
  );
}
