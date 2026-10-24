'use client';

import HomeHeroVideoBackground from '@/components/site/HomeHeroVideoBackground';

/**
 * Loaded only on the client (`dynamic` + `ssr: false` via `HomeHeroVideoDynamic`).
 * Single background layer — fills `#home` via `absolute inset-0` + `min-h-full` in the background module.
 */
export default function HomeHeroVideoClient() {
  return <HomeHeroVideoBackground />;
}
