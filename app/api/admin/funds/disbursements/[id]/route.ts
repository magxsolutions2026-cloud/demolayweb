import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { logFundActivity } from '@/lib/fundActivityLog';
import { execute, query } from '@/lib/db';
import { parseAmount, parseDateOnly, sanitizeText, sanitizeTitle } from '@/lib/fundsValidation';

function sanitizeCategory(v: unknown): string {
  return String(v ?? '')
    .trim()
    .slice(0, 64);
}

export async function PUT(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

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
  if (!disbursementDate) return NextResponse.json({ error: 'Valid date required' }, { status: 400 });

  const purpose = sanitizeText(body.purpose) || null;

  const { rowCount } = await execute(
    `UPDATE disbursements SET title=?, amount=?, category=?, disbursement_date=?, purpose=? WHERE id=?`,
    [title, amount, category, disbursementDate, purpose, id],
  );
  if (!rowCount) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await logFundActivity('disbursement', `Updated disbursement: ${title}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, ctx: { params: Promise<{ id: string }> }) {
  await requireAdmin(request);
  const { id: idStr } = await ctx.params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

  const prev = await query('SELECT title FROM disbursements WHERE id = ?', [id]);
  const { rowCount: del } = await execute('DELETE FROM disbursements WHERE id = ?', [id]);
  if (!del) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const title = Array.isArray(prev) && prev[0] ? String((prev[0] as { title: string }).title) : String(id);
  await logFundActivity('disbursement', `Removed disbursement: ${title}`);
  return NextResponse.json({ ok: true });
}
