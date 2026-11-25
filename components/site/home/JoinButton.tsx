'use client';

import { ArrowUpRight } from 'lucide-react';
import { useJoinUsModal } from '../JoinUsModalContext';

/** Primary "petition" call to action that opens the Join Us modal. */
export default function JoinButton({ label = 'Petition for entry' }: { label?: string }) {
  const { open } = useJoinUsModal();
  return (
    <button type="button" onClick={open} className="cta-primary gap-2 text-sm uppercase tracking-[0.18em]">
      {label}
      <ArrowUpRight className="h-4 w-4" aria-hidden />
    </button>
  );
}
