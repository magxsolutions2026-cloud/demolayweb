import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OfficersSection } from '@/components/admin/sections/OfficersSection';

export const metadata: Metadata = { title: 'Officers · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <OfficersSection />
    </Suspense>
  );
}
