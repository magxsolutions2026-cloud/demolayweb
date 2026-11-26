import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FundsSection } from '@/components/admin/sections/FundsSection';

export const metadata: Metadata = { title: 'Funds · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <FundsSection />
    </Suspense>
  );
}
