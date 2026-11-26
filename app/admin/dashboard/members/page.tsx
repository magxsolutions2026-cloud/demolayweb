import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MembersSection } from '@/components/admin/sections/MembersSection';

export const metadata: Metadata = { title: 'Members · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <MembersSection />
    </Suspense>
  );
}
