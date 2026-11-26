import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SettingsSection } from '@/components/admin/sections/SettingsSection';

export const metadata: Metadata = { title: 'Settings · Admin console' };

export default function Page() {
  return (
    <Suspense>
      <SettingsSection />
    </Suspense>
  );
}
