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

export async function GET(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const rows = (await query(
    `SELECT c.id, c.name, c.slug, c.goal_amount, c.start_date, c.end_date, c.status, c.campaign_type,
            c.summary, c.description, c.cover_image_url, c.image_urls, c.unit_price, c.size_options, c.created_at, c.updated_at,
            COALESCE((SELECT SUM(amount) FROM fund_sources WHERE campaign_id = c.id), 0)
              + COALESCE((SELECT SUM(total_amount) FROM campaign_orders WHERE campaign_id = c.id), 0) AS raised,
            COALESCE((SELECT COUNT(*) FROM campaign_orders WHERE campaign_id = c.id), 0) AS order_count,
            COALESCE((SELECT SUM(quantity) FROM campaign_orders WHERE campaign_id = c.id), 0) AS shirts_sold
     FROM campaigns c WHERE c.id = ?`,
    [id],
  )) as Record<string, unknown>[];

  if (!rows.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const contributions = (await query(
    `SELECT id, title, amount, source_type, source_specify, source_date, description
     FROM fund_sources WHERE campaign_id = ? ORDER BY source_date DESC, id DESC`,
    [id],
  )) as Record<string, unknown>[];

  const orders = (await query(
    `SELECT id, brother_name, email, phone, shirt_size, quantity, unit_price, total_amount, notes, created_at
     FROM campaign_orders
     WHERE campaign_id = ?
     ORDER BY created_at DESC, id DESC`,
    [id],
  )) as Record<string, unknown>[];

  const totals = (await query(
    `SELECT COUNT(*) AS total_orders,
            COALESCE(SUM(quantity), 0) AS total_shirts,
            COALESCE(SUM(total_amount), 0) AS total_amount
     FROM campaign_orders
     WHERE campaign_id = ?`,
    [id],
  )) as Record<string, unknown>[];

  const sizes = (await query(
    `SELECT shirt_size, COALESCE(SUM(quantity), 0) AS quantity
     FROM campaign_orders
     WHERE campaign_id = ?
     GROUP BY shirt_size
     ORDER BY shirt_size ASC`,
    [id],
  )) as Record<string, unknown>[];

  const summary = Array.isArray(totals) && totals.length > 0 ? totals[0] : null;

  return NextResponse.json({
    campaign: normalizeCampaignRow(rows[0]),
    contributions,
    orders,
    orderSummary: {
      totalOrders: Number(summary?.total_orders ?? 0),
      totalShirts: Number(summary?.total_shirts ?? 0),
      totalAmount: Number(summary?.total_amount ?? 0),
      sizeBreakdown: sizes.map((row) => ({
        size: String(row.shirt_size ?? ''),
        quantity: Number(row.quantity ?? 0),
      })),
    },
  });
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json();
  const name = sanitizeTitle(body.name);
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

  const goal = parseAmount(body.goal_amount);
  if (goal === null || goal === 0) return NextResponse.json({ error: 'Valid goal amount required' }, { status: 400 });

  const start = parseDateOnly(body.start_date);
  const end = parseDateOnly(body.end_date);
  if (!start || !end) return NextResponse.json({ error: 'Valid dates required' }, { status: 400 });
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
  const slug = campaignType === 'tshirt' ? await ensureUniqueSlug(body.slug, name, id) : null;

  if (campaignType === 'tshirt' && (!unitPrice || unitPrice <= 0)) {
    return NextResponse.json({ error: 'Valid shirt price required for T-shirt campaigns' }, { status: 400 });
  }

  const { rowCount: updated } = await execute(
    `UPDATE campaigns
     SET name=?, slug=?, goal_amount=?, start_date=?, end_date=?, status=?, campaign_type=?, summary=?, description=?, cover_image_url=?, image_urls=?, unit_price=?, size_options=?
     WHERE id=?`,
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
      id,
    ],
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await logFundActivity('campaign', `Updated ${campaignType === 'tshirt' ? 'T-shirt' : 'fundraising'} campaign: ${name}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const orderRows = await query<{ total_orders: number }>(
    'SELECT COUNT(*) AS total_orders FROM campaign_orders WHERE campaign_id = ?',
    [id],
  );
  const totalOrders = Array.isArray(orderRows) && orderRows[0] ? Number(orderRows[0].total_orders ?? 0) : 0;
  if (totalOrders > 0) {
    return NextResponse.json({ error: 'Cannot delete a campaign that already has recorded orders.' }, { status: 409 });
  }

  const prev = await query('SELECT name FROM campaigns WHERE id = ?', [id]);
  const { rowCount: removed } = await execute('DELETE FROM campaigns WHERE id = ?', [id]);
  if (!removed) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const name = Array.isArray(prev) && prev[0] ? String((prev[0] as { name: string }).name) : String(id);
  await logFundActivity('campaign', `Removed campaign: ${name}`);
  return NextResponse.json({ ok: true });
}
