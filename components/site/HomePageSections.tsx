import HeroVideoParallax from '@/components/site/HeroVideoParallax';
import HomeHeroVideoDynamic from '@/components/site/HomeHeroVideoDynamic';
import InteractiveHeroHUD from '@/components/site/InteractiveHeroHUD';
import HomeConnect from '@/components/site/home/HomeConnect';
import HomeGlobe from '@/components/site/home/HomeGlobe';
import HomeHappenings from '@/components/site/home/HomeHappenings';
import HomeIntro from '@/components/site/home/HomeIntro';
import HomeJoinBand from '@/components/site/home/HomeJoinBand';
import HomeOfficers from '@/components/site/home/HomeOfficers';
import HomeStatStrip from '@/components/site/home/HomeStatStrip';
import HomeVirtues from '@/components/site/home/HomeVirtues';
import type { HomeData } from '@/lib/homeData';

/**
 * Entire home route layout, told as a story: hero, who we are, virtues, what's happening, the wider
 * Philippine jurisdiction, officers, how to join, and where to find us. Sections live in components/site/home.
 */
export default function HomePageSections({ data }: { data: HomeData }) {
  return (
    <main className="page-enter relative">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[100dvh] w-full overflow-hidden" aria-hidden>
        <HeroVideoParallax>
          <HomeHeroVideoDynamic />
        </HeroVideoParallax>
      </div>
      <section id="home" className="relative z-10 min-h-[100dvh] w-full">
        <InteractiveHeroHUD />
      </section>

      <div className="home-body relative z-10 w-full">
        <HomeStatStrip />
        <HomeIntro />
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
