import { NextResponse } from 'next/server';
import { execute, query } from '@/lib/db';
import { parseNewsImageUrls, serializeNewsImageUrls } from '@/lib/newsImages';
import { requireAdmin } from '@/lib/auth';
import { NewsletterMailError, sendNewsPublishedEmail } from '@/lib/newsletterEmail';
import { htmlToPlainText } from '@/lib/plainText';
import { resolveSiteUrl } from '@/lib/siteUrl';
import { cleanBoolean, cleanLongText, cleanText } from '@/lib/validation';

function toSlug(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: Request) {
  await requireAdmin(request);
  const rows = await query<{
    id: number;
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    image_urls?: unknown;
    is_published: number;
    published_at?: string;
    created_at?: string;
  }>(
    'SELECT id, title, slug, summary, content, image_urls, is_published, published_at, created_at FROM news ORDER BY published_at DESC, created_at DESC'
  );
  const news = rows.map((item) => ({
    ...item,
    image_urls: parseNewsImageUrls(item.image_urls),
  }));
  return NextResponse.json({ news });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const title = cleanText(body.title, 255);
  const slug = cleanText(body.slug, 255);
  const summary = cleanLongText(htmlToPlainText(body.summary), 1200);
  const content = cleanLongText(htmlToPlainText(body.content), 12000);
  const imageUrls = serializeNewsImageUrls(body.image_urls);
  const is_published = cleanBoolean(body.is_published);
  const published_at = body.published_at;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const safeSlug = toSlug(slug || title);
  if (!safeSlug) {
    return NextResponse.json({ error: 'Slug generation failed' }, { status: 400 });
  }

  const { rows: inserted } = await execute(
    'INSERT INTO news (title, slug, summary, content, image_urls, is_published, published_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
    [title, safeSlug, summary || '', content || '', imageUrls, is_published ? 1 : 0, published_at || new Date()]
  );

  const recordId = Number(inserted[0]?.id || 0);
  let mailSent = false;
  let mailError: string | null = null;

  if (is_published && recordId) {
    try {
      const subscribers = await query<{ email: string }>('SELECT email FROM subscribers ORDER BY date_subscribed DESC');
      const recipients = subscribers.map((row) => row.email);
      const siteUrl = resolveSiteUrl(request);
      const mailResult = await sendNewsPublishedEmail({
        recipients,
        news: { title, summary, publishedAt: published_at },
        siteUrl,
      });
      mailSent = mailResult.sent > 0 || recipients.length === 0;
      if (mailSent) {
        await query('UPDATE news SET newsletter_sent_at = ? WHERE id = ?', [new Date(), recordId]);
      }
    } catch (error) {
      console.error('Failed to send news newsletter email', error);
      mailError =
        error instanceof NewsletterMailError
          ? error.message
          : 'News was published, but the newsletter email could not be sent.';
    }
  }

  return NextResponse.json({ success: true, mailSent, mailError });
}
