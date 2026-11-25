import type React from 'react';
import { Orbitron } from 'next/font/google';
import HomeHeroVideoDynamic from '@/components/site/HomeHeroVideoDynamic';
import InteractiveHeroHUD from '@/components/site/InteractiveHeroHUD';
import HomeConnect from '@/components/site/home/HomeConnect';
import HomeGlobe from '@/components/site/home/HomeGlobe';
import HomeHappenings from '@/components/site/home/HomeHappenings';
import HomeJoinBand from '@/components/site/home/HomeJoinBand';
import HomeOfficers from '@/components/site/home/HomeOfficers';
import HomeVirtues from '@/components/site/home/HomeVirtues';
import type { HomeData } from '@/lib/homeData';

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'], variable: '--font-orbitron' });

/**
 * Entire home route layout, told as a story: hero, who we are, virtues, what's happening, the wider
 * Philippine jurisdiction, officers, how to join, and where to find us. Sections live in components/site/home.
 */
export default function HomePageSections({ data }: { data: HomeData }) {
  return (
    <main
      className={`${orbitron.variable} relative`}
      // Point every font utility (serif, sans, mono) at Orbitron for the whole landing page.
      style={{ '--font-serif': 'var(--font-orbitron)', '--font-sans': 'var(--font-orbitron)', '--font-mono': 'var(--font-orbitron)', fontFamily: 'var(--font-orbitron)' } as React.CSSProperties}
    >
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100dvh] w-full overflow-hidden" aria-hidden>
        <HomeHeroVideoDynamic />
      </div>
      <section id="home" className="relative z-10 min-h-[100dvh] w-full">
        <InteractiveHeroHUD />
      </section>

      <div className="relative z-10 w-full">
        <HomeVirtues />
        <HomeHappenings events={data.events} news={data.news} />
        <HomeGlobe />
        <HomeOfficers officers={data.officers} />
        <HomeJoinBand />
        <HomeConnect />
      </div>
    </main>
  );
}
