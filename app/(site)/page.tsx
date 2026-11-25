import HomePageSections from '@/components/site/HomePageSections';
import { loadHomeData } from '@/lib/homeData';

/** Cached and refreshed in the background at most once a minute, so navigation is instant. */
export const revalidate = 60;

export default async function Page() {
  return <HomePageSections data={await loadHomeData()} />;
}
