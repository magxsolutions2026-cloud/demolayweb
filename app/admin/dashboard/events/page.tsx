import type { Metadata } from 'next';
import { Suspense } from 'react';
import { EventsSection } from '@/components/admin/sections/EventsSection';

export const metadata: Metadata = { title: 'Events · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <EventsSection />
    </Suspense>
  );
}
