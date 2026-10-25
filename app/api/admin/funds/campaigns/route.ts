import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { parseCampaignImageUrls, serializeCampaignImageUrls } from '@/lib/campaignImages';
import { logFundActivity } from '@/lib/fundActivityLog';
import { execute, query } from '@/lib/db';
import {
  parseAmount,
  parseCampaignSizeOptions,
  parseCampaignStatus,
  parseCampaignType,
  parseDateOnly,
  sanitizeSlug,
  sanitizeText,
  sanitizeTitle,
  serializeCampaignSizeOptions,
} from '@/lib/fundsValidation';

async function ensureUniqueSlug(rawSlug: unknown, fallbackName: string, excludeId?: number) {
  const base = sanitizeSlug(rawSlug) || sanitizeSlug(fallbackName) || 'campaign';
  let candidate = base;
  let suffix = 2;

  for (;;) {
    const rows = excludeId == null
      ? await query<{ id: number }>('SELECT id FROM campaigns WHERE slug = ? LIMIT 1', [candidate])
      : await query<{ id: number }>('SELECT id FROM campaigns WHERE slug = ? AND id <> ? LIMIT 1', [candidate, excludeId]);

    if (!Array.isArray(rows) || rows.length === 0) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

function normalizeCampaignRow(row: Record<string, unknown>) {
  return {
    ...row,
    cover_image_url: row.cover_image_url != null ? String(row.cover_image_url) : null,
    image_urls: parseCampaignImageUrls(row.image_urls, row.cover_image_url),
    unit_price: row.unit_price != null ? Number(row.unit_price) : null,
    raised: Number(row.raised ?? 0),
    order_count: Number(row.order_count ?? 0),
    shirts_sold: Number(row.shirts_sold ?? 0),
    size_options: row.campaign_type === 'tshirt' ? parseCampaignSizeOptions(row.size_options) : [],
  };
}

export async function GET(request: Request) {
  await requireAdmin(request);

  const rows = (await query(
    `SELECT c.id, c.name, c.slug, c.goal_amount, c.start_date, c.end_date, c.status, c.campaign_type,
            c.summary, c.description, c.cover_image_url, c.image_urls, c.unit_price, c.size_options, c.created_at, c.updated_at,
            COALESCE((SELECT SUM(amount) FROM fund_sources WHERE campaign_id = c.id), 0)
              + COALESCE((SELECT SUM(total_amount) FROM campaign_orders WHERE campaign_id = c.id), 0) AS raised,
            COALESCE((SELECT COUNT(*) FROM campaign_orders WHERE campaign_id = c.id), 0) AS order_count,
            COALESCE((SELECT SUM(quantity) FROM campaign_orders WHERE campaign_id = c.id), 0) AS shirts_sold
     FROM campaigns c
     ORDER BY c.created_at DESC, c.id DESC`,
  )) as Record<string, unknown>[];

  return NextResponse.json({ campaigns: rows.map(normalizeCampaignRow) });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const name = sanitizeTitle(body.name);
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const goal = parseAmount(body.goal_amount);
  if (goal === null || goal === 0) return NextResponse.json({ error: 'Valid goal amount required' }, { status: 400 });

  const start = parseDateOnly(body.start_date);
  const end = parseDateOnly(body.end_date);
  if (!start || !end) return NextResponse.json({ error: 'Valid start and end dates required' }, { status: 400 });
  if (end < start) return NextResponse.json({ error: 'End date must be on or after start date' }, { status: 400 });

  const status = parseCampaignStatus(body.status) || 'active';
  const campaignType = parseCampaignType(body.campaign_type) || 'general';
  const summary = sanitizeText(body.summary || '').slice(0, 600) || null;
  const description = sanitizeText(body.description) || null;
  const legacyCoverImageUrl = String(body.cover_image_url ?? '').trim().slice(0, 512) || null;
  const imageUrls = parseCampaignImageUrls(body.image_urls, legacyCoverImageUrl);
  const coverImageUrl = imageUrls[0] || legacyCoverImageUrl || null;
  const unitPrice = body.unit_price === '' || body.unit_price == null ? null : parseAmount(body.unit_price);
  const sizeOptions = campaignType === 'tshirt' ? parseCampaignSizeOptions(body.size_options) : [];
  const slug = campaignType === 'tshirt' ? await ensureUniqueSlug(body.slug, name) : null;

  if (campaignType === 'tshirt' && (!unitPrice || unitPrice <= 0)) {
    return NextResponse.json({ error: 'Valid shirt price required for T-shirt campaigns' }, { status: 400 });
  }

  const { rows: inserted } = await execute(
    `INSERT INTO campaigns
      (name, slug, goal_amount, start_date, end_date, status, campaign_type, summary, description, cover_image_url, image_urls, unit_price, size_options)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     RETURNING id`,
    [
      name,
      slug,
      goal,
      start,
      end,
      status,
      campaignType,
      summary,
      description,
      coverImageUrl,
      serializeCampaignImageUrls(imageUrls),
      unitPrice,
      campaignType === 'tshirt' ? serializeCampaignSizeOptions(sizeOptions) : null,
    ],
  );

  await logFundActivity('campaign', `Created ${campaignType === 'tshirt' ? 'T-shirt' : 'fundraising'} campaign: ${name}`);

  return NextResponse.json({ ok: true, id: Number(inserted[0]?.id ?? 0) });
}
