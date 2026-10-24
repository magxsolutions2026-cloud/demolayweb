'use client';

import dynamic from 'next/dynamic';
import { HeroVideoPlaceholder } from '@/components/site/HeroVideoPlaceholder';

const HomeHeroVideoClient = dynamic(
  () => import('@/components/site/HomeHeroVideoClient'),
  { ssr: false, loading: () => <HeroVideoPlaceholder /> },
);

/**
 * Client-only island: `ssr: false` is not allowed from Server Components (see `page.tsx`).
 * SSR emits `HeroVideoPlaceholder` HTML; the real video layer hydrates after the chunk loads.
 */
export default function HomeHeroVideoDynamic() {
  return <HomeHeroVideoClient />;
}
