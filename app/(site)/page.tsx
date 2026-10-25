import HomePageSections, { type HomeHeroContent } from '@/components/site/HomePageSections';
import { query } from '@/lib/db';
import { parseCampaignImageUrls } from '@/lib/campaignImages';
import { formatSqlDate, formatSqlDateTime } from '@/lib/formatDb';
import { parseCampaignSizeOptions } from '@/lib/fundsValidation';
import { buildHomeFeed } from '@/lib/homeFeed';
import { parseNewsImageUrls } from '@/lib/newsImages';

export const dynamic = 'force-dynamic';

interface LandingMap {
  [key: string]: unknown;
}

interface EventItem {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description?: string;
  category?: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_urls?: string[];
  published_at?: string;
}

interface CampaignItem {
  id: number;
  name: string;
  slug: string;
  summary?: string;
  description?: string;
  start_date: string;
  end_date: string;
  status: string;
  unit_price: number | string;
  size_options: string | string[];
  cover_image_url?: string | null;
  image_urls?: string[];
  created_at?: string;
}

async function fetchLanding() {
  try {
    const rows = await query<{ section: string; content: string }>('SELECT section, content FROM landing_content');
    return Array.isArray(rows)
      ? rows.reduce((acc, row) => {
          acc[row.section] = JSON.parse(row.content);
          return acc;
        }, {} as LandingMap)
      : {};
  } catch {
    return {};
  }
}

async function fetchEvents() {
  try {
    return await query<EventItem>(
      'SELECT id, title, event_date, event_time, location, description, category FROM events ORDER BY event_date DESC, id DESC',
    );
  } catch {
    return [];
  }
}

async function fetchNewsForFeed() {
  try {
    return await query<NewsItem>(
      'SELECT id, title, slug, summary, content, image_urls, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC, created_at DESC LIMIT 40',
    );
  } catch {
    return [];
  }
}

async function fetchCampaignsForFeed() {
  try {
    return await query<CampaignItem>(
      `SELECT id, name, slug, summary, description, start_date, end_date, status, unit_price, size_options, cover_image_url, image_urls, created_at
       FROM campaigns
       WHERE campaign_type = 'tshirt'
         AND status = 'active'
         AND slug IS NOT NULL
         AND CURRENT_DATE BETWEEN start_date AND end_date
       ORDER BY created_at DESC, id DESC`,
    );
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const landing = await fetchLanding();
  const eventsRaw = await fetchEvents();
  const newsRaw = await fetchNewsForFeed();
  const campaignsRaw = await fetchCampaignsForFeed();

  const events: EventItem[] = eventsRaw.map((e) => ({
    ...e,
    event_date: formatSqlDate(e.event_date),
  }));
  const news: NewsItem[] = newsRaw.map((n) => ({
    ...n,
    image_urls: parseNewsImageUrls(n.image_urls),
    published_at: n.published_at != null ? formatSqlDateTime(n.published_at) : undefined,
  }));
  const campaigns = campaignsRaw
    .filter((campaign) => !!campaign.slug)
    .map((campaign) => ({
      ...campaign,
      start_date: formatSqlDate(campaign.start_date),
      end_date: formatSqlDate(campaign.end_date),
      created_at: campaign.created_at != null ? formatSqlDateTime(campaign.created_at) : undefined,
      unit_price: Number(campaign.unit_price ?? 0),
      size_options: parseCampaignSizeOptions(campaign.size_options),
      image_urls: parseCampaignImageUrls(campaign.image_urls, campaign.cover_image_url),
    }));

  const hero = (landing.hero as HomeHeroContent | undefined) || {
    title: 'T. De Leon Chapter No. 47',
    subtitle: 'Order of DeMolay',
    cta: 'Join Us',
  };
  const feedItems = buildHomeFeed(news, events, campaigns);

  return <HomePageSections hero={hero} feedItems={feedItems} />;
}
