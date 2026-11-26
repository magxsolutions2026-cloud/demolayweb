'use client';

import { StatusChip, toneFor } from '@/components/admin/ui/StatusChip';

/** Status pill; the variant name (pending, approved, published, …) picks the tone. */
export function AdminBadge({
  children,
  variant = 'activity',
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) {
  return <StatusChip tone={toneFor(variant)}>{children}</StatusChip>;
}
