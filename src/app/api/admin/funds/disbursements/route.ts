import type { ResultSetHeader } from 'mysql2';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logFundActivity } from '@/lib/fundActivityLog';
import { pool, query } from '@/lib/db';
import { parseAmount, parseDateOnly, sanitizeText, sanitizeTitle } from '@/lib/fundsValidation';

const CAT_MAX = 64;

function sanitizeCategory(v: unknown): string {
  return String(v ?? '')
    .trim()
    .slice(0, CAT_MAX);
}

export async function GET(request: Request) {
  await requireAdmin(request);
  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const sort = searchParams.get('sort') === 'amount' ? 'amount' : 'date';
  const order = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';

  const rows = (await query(
    `SELECT id, title, amount, category, disbursement_date, purpose FROM disbursements
     ORDER BY ${sort === 'amount' ? 'amount' : 'disbursement_date'} ${order}, id DESC`,
  )) as Record<string, unknown>[];

  const filtered = search
    ? rows.filter((r) => {
        const t = String(r.title ?? '').toLowerCase();
        const p = String(r.purpose ?? '').toLowerCase();
        const c = String(r.category ?? '').toLowerCase();
        return t.includes(search) || p.includes(search) || c.includes(search);
      })
    : rows;

  return NextResponse.json({ disbursements: filtered });
}

export async function POST(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const title = sanitizeTitle(body.title);
  if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });

  const amount = parseAmount(body.amount);
  if (amount === null || amount === 0) {
    return NextResponse.json({ error: 'Valid positive amount required' }, { status: 400 });
  }

  const category = sanitizeCategory(body.category);
  if (!category) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

  const disbursementDate = parseDateOnly(body.disbursement_date);
  if (!disbursementDate) return NextResponse.json({ error: 'Valid date (YYYY-MM-DD) required' }, { status: 400 });

  const purpose = sanitizeText(body.purpose) || null;

  const [ins] = await pool.execute<ResultSetHeader>(
    `INSERT INTO disbursements (title, amount, category, disbursement_date, purpose) VALUES (?, ?, ?, ?, ?)`,
    [title, amount, category, disbursementDate, purpose],
  );

  await logFundActivity('disbursement', `Recorded disbursement: ${title} (${amount})`);

  return NextResponse.json({ ok: true, id: Number(ins.insertId ?? 0) });
}
