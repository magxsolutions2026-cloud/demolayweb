import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logFundActivity } from '@/lib/fundActivityLog';
import { execute, query } from '@/lib/db';
import {
  parseAmount,
  parseDateOnly,
  parseSourceType,
  sanitizeSourceSpecify,
  sanitizeText,
  sanitizeTitle,
} from '@/lib/fundsValidation';

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const body = await request.json();
  const title = sanitizeTitle(body.title);
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const amount = parseAmount(body.amount);
  if (amount === null) return NextResponse.json({ error: 'Valid non-negative amount required' }, { status: 400 });

  const sourceType = parseSourceType(body.source_type) || 'donations';
  const sourceDate = parseDateOnly(body.source_date);
  if (!sourceDate) return NextResponse.json({ error: 'Valid source_date required' }, { status: 400 });

  let sourceSpecify = sanitizeSourceSpecify(body.source_specify);
  if (sourceType === 'other') {
    if (!sourceSpecify) {
      return NextResponse.json({ error: 'Please specify the source type when “Other” is selected' }, { status: 400 });
    }
  } else {
    sourceSpecify = null;
  }

  const description = sanitizeText(body.description) || null;
  let campaignId: number | null = null;
  if (body.campaign_id != null && body.campaign_id !== '') {
    const cid = Number(body.campaign_id);
    if (!Number.isFinite(cid)) return NextResponse.json({ error: 'Invalid campaign' }, { status: 400 });
    const c = await query('SELECT id FROM campaigns WHERE id = ?', [cid]);
    if (!Array.isArray(c) || c.length === 0) return NextResponse.json({ error: 'Campaign not found' }, { status: 400 });
    campaignId = cid;
  }

  const { rowCount } = await execute(
    `UPDATE fund_sources SET title=?, amount=?, source_type=?, source_specify=?, source_date=?, description=?, campaign_id=?
     WHERE id=?`,
    [title, amount, sourceType, sourceSpecify, sourceDate, description, campaignId, id],
  );
  if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await logFundActivity('fund_source', `Updated fund source: ${title}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const prev = await query('SELECT title FROM fund_sources WHERE id = ?', [id]);
  const { rowCount: del } = await execute('DELETE FROM fund_sources WHERE id = ?', [id]);
  if (!del) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const title = Array.isArray(prev) && prev[0] ? String((prev[0] as { title: string }).title) : String(id);
  await logFundActivity('fund_source', `Removed fund source: ${title}`);
  return NextResponse.json({ ok: true });
}
