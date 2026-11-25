import HomePageSections from '@/components/site/HomePageSections';
import { loadHomeData } from '@/lib/homeData';

export const dynamic = 'force-dynamic';

export default async function Page() {
  return <HomePageSections data={await loadHomeData()} />;
}
