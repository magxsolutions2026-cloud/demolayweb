import type { Metadata } from 'next';
import { Suspense } from 'react';
import { NewsSection } from '@/components/admin/sections/NewsSection';

export const metadata: Metadata = { title: 'News · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <NewsSection />
    </Suspense>
  );
}
