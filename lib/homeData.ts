import { query } from '@/lib/db';
import { formatSqlDate, formatSqlDateTime } from '@/lib/formatDb';
import { parseNewsImageUrls } from '@/lib/newsImages';
import { listOfficersOrderedByName, type OfficerRow } from '@/lib/officersDb';

export type HomeEvent = {
  id: number;
  title: string;
  event_date: string;
  event_time: string;
  location: string;
  description?: string;
  category?: string;
};

export type HomeNews = {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  image_urls: string[];
  published_at?: string;
};

export type HomeData = { events: HomeEvent[]; news: HomeNews[]; officers: OfficerRow[] };

/** Real chapter data for the landing page; each part is empty when the database is unavailable. */
export async function loadHomeData(): Promise<HomeData> {
  const [events, news, officers] = await Promise.all([
    query<HomeEvent>(
      'SELECT id, title, event_date, event_time, location, description, category FROM events WHERE event_date >= CURRENT_DATE ORDER BY event_date ASC, id ASC LIMIT 4',
    )
      .then((rows) => rows.map((e) => ({ ...e, event_date: formatSqlDate(e.event_date) })))
      .catch(() => []),
    query<Omit<HomeNews, 'image_urls'> & { image_urls: unknown }>(
      'SELECT id, title, slug, summary, image_urls, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC, created_at DESC LIMIT 3',
    )
      .then((rows) =>
        rows.map((n) => ({
          ...n,
          image_urls: parseNewsImageUrls(n.image_urls),
          published_at: n.published_at ? formatSqlDateTime(n.published_at) : undefined,
        })),
      )
      .catch(() => []),
    listOfficersOrderedByName().catch(() => []),
  ]);
  return { events, news, officers };
}
