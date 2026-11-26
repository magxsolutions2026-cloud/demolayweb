import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SubscribersSection } from '@/components/admin/sections/SubscribersSection';

export const metadata: Metadata = { title: 'Subscribers · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <SubscribersSection />
    </Suspense>
  );
}
