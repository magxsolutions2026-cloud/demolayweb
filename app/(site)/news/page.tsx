import PublicNewsSection from '@/components/PublicNewsSection';
import { query } from '@/lib/db';
import { formatSqlDateTime } from '@/lib/formatDb';
import { parseNewsImageUrls } from '@/lib/newsImages';

export const dynamic = 'force-dynamic';

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  image_urls?: string[];
  published_at?: string;
}

async function fetchNews() {
  try {
    return await query<NewsItem>(
      'SELECT id, title, slug, summary, content, image_urls, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC, created_at DESC LIMIT 24',
    );
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const raw = await fetchNews();
  const news = raw.map((n) => ({
    ...n,
    image_urls: parseNewsImageUrls(n.image_urls),
    published_at: n.published_at != null ? formatSqlDateTime(n.published_at) : undefined,
  }));

  return (
    <main className="py-24 md:py-28">
      <div className="mx-auto mb-8 max-w-6xl px-6 md:px-10">
        <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Stories</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">News & announcements</h1>
      </div>
      <PublicNewsSection items={news} hideHeading />
    </main>
  );
}
