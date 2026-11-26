import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AccountsSection } from '@/components/admin/sections/AccountsSection';

export const metadata: Metadata = { title: 'Accounts · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <AccountsSection />
    </Suspense>
  );
}
