'use client';

import Link from 'next/link';
import { useJoinUsModal } from './JoinUsModalContext';

export function HeroCTAs({ ctaLabel }: { ctaLabel: string }) {
  const { open } = useJoinUsModal();
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
      <button type="button" onClick={open} className="cta-primary btn-shine">
        {ctaLabel || 'Join Us'}
      </button>
      <Link href="/events" className="cta-ghost">
        View Events
      </Link>
    </div>
  );
}
