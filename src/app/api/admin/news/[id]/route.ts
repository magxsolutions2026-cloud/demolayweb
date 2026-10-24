import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { serializeNewsImageUrls } from '@/lib/newsImages';
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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id } = await context.params;
  const recordId = Number(id);
  if (!recordId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  const body = await request.json();
  const title = cleanText(body.title, 255);
  const slug = cleanText(body.slug, 255);
  const summary = cleanLongText(htmlToPlainText(body.summary), 1200);
  const content = cleanLongText(htmlToPlainText(body.content), 12000);
  const imageUrls = serializeNewsImageUrls(body.image_urls);
  const is_published = cleanBoolean(body.is_published);
  const published_at = body.published_at;
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const safeSlug = toSlug(slug || title);

  const existing = await query<{ is_published: number; newsletter_sent_at?: string | null }>(
    'SELECT is_published, newsletter_sent_at FROM news WHERE id = ? LIMIT 1',
    [recordId]
  );
  if (!existing[0]) {
    return NextResponse.json({ error: 'News not found' }, { status: 404 });
  }

  await query(
    'UPDATE news SET title = ?, slug = ?, summary = ?, content = ?, image_urls = ?, is_published = ?, published_at = ? WHERE id = ?',
    [title, safeSlug, summary || '', content || '', imageUrls, is_published ? 1 : 0, published_at || new Date(), recordId]
  );
  let mailSent = false;
  let mailError: string | null = null;
  const shouldSendNewsletter = is_published && !existing[0].newsletter_sent_at;

  if (shouldSendNewsletter) {
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

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id } = await context.params;
  const recordId = Number(id);
  if (!recordId) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

  await query('DELETE FROM news WHERE id = ?', [recordId]);
  return NextResponse.json({ success: true });
}
