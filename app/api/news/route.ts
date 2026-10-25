import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { parseNewsImageUrls } from '@/lib/newsImages';

export async function GET() {
  const rows = await query<{
    id: number;
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    image_urls?: unknown;
    published_at?: string;
  }>(
    'SELECT id, title, slug, summary, content, image_urls, published_at FROM news WHERE is_published = 1 ORDER BY published_at DESC, created_at DESC'
  );
  return NextResponse.json({
    news: rows.map((item) => ({
      ...item,
      image_urls: parseNewsImageUrls(item.image_urls),
    })),
  });
}
