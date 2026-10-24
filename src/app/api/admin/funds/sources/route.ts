import type { ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logFundActivity } from '@/lib/fundActivityLog';
import { pool, query } from '@/lib/db';
import {
  parseAmount,
  parseDateOnly,
  parseSourceType,
  sanitizeSourceSpecify,
  sanitizeText,
  sanitizeTitle,
} from '@/lib/fundsValidation';

export async function GET(request: Request) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const sort = searchParams.get('sort') === 'amount' ? 'amount' : 'date';
  const order = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';

  const rows = (await query(
    `SELECT fs.id, fs.title, fs.amount, fs.source_type, fs.source_specify, fs.source_date, fs.description, fs.campaign_id,
            c.name as campaign_name
     FROM fund_sources fs
     LEFT JOIN campaigns c ON c.id = fs.campaign_id
     ORDER BY ${sort === 'amount' ? 'fs.amount' : 'fs.source_date'} ${order}, fs.id DESC`,
  )) as Record<string, unknown>[];

  const filtered = search
    ? rows.filter((r) => {
        const t = String(r.title ?? '').toLowerCase();
        const d = String(r.description ?? '').toLowerCase();
        return t.includes(search) || d.includes(search);
      })
    : rows;

  return NextResponse.json({ sources: filtered });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const title = sanitizeTitle(body.title);
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const amount = parseAmount(body.amount);
  if (amount === null) return NextResponse.json({ error: 'Valid non-negative amount required' }, { status: 400 });

  const sourceType = parseSourceType(body.source_type) || 'donations';
  const sourceDate = parseDateOnly(body.source_date);
  if (!sourceDate) return NextResponse.json({ error: 'Valid source_date (YYYY-MM-DD) required' }, { status: 400 });

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

  const [ins] = await pool.execute<ResultSetHeader>(
    `INSERT INTO fund_sources (title, amount, source_type, source_specify, source_date, description, campaign_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [title, amount, sourceType, sourceSpecify, sourceDate, description, campaignId],
  );
  const id = Number(ins.insertId ?? 0);

  await logFundActivity('fund_source', `Added fund source: ${title} (${amount})`);

  return NextResponse.json({ ok: true, id });
}
