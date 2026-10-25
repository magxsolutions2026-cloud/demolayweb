import { NextResponse } from 'next/server';
import { publishAdminRealtime } from '@/lib/adminRealtime';
import { logFundActivity } from '@/lib/fundActivityLog';
import { execute, query } from '@/lib/db';
import {
  looksLikeEmail,
  parseAmount,
  parseCampaignSizeOptions,
  parsePositiveInt,
  sanitizeEmail,
  sanitizePhone,
  sanitizeText,
  sanitizeTitle,
} from '@/lib/fundsValidation';

type CampaignRow = {
  id: number;
  name: string;
  campaign_type: string;
  status: string;
  start_date: string;
  end_date: string;
  unit_price: number | string | null;
  size_options: string | null;
};

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const contentType = request.headers.get('content-type') || '';
  let payload: Record<string, FormDataEntryValue | string> = {};

  if (contentType.includes('application/json')) {
    payload = await request.json();
  } else {
    const formData = await request.formData();
    payload = Object.fromEntries(formData.entries());
  }

  const rows = await query<CampaignRow>(
    `SELECT id, name, campaign_type, status, start_date, end_date, unit_price, size_options
     FROM campaigns
     WHERE slug = ?
     LIMIT 1`,
    [slug],
  );
  const campaign = Array.isArray(rows) && rows.length > 0 ? rows[0] : null;

  if (!campaign || campaign.campaign_type !== 'tshirt') {
    return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
  }
  if (campaign.status !== 'active') {
    return NextResponse.json({ error: 'This campaign is not accepting orders right now.' }, { status: 409 });
  }

  const today = todayIsoDate();
  if (today < campaign.start_date || today > campaign.end_date) {
    return NextResponse.json({ error: 'This campaign is outside its order window.' }, { status: 409 });
  }

  const brotherName = sanitizeTitle(payload.brother_name);
  const email = sanitizeEmail(payload.email);
  const phone = sanitizePhone(payload.phone) || null;
  const notes = sanitizeText(payload.notes) || null;
  const shirtSize = sanitizeTitle(payload.shirt_size).toUpperCase().slice(0, 32);
  const quantity = parsePositiveInt(payload.quantity, 24);
  const unitPrice = parseAmount(campaign.unit_price);
  const allowedSizes = parseCampaignSizeOptions(campaign.size_options);

  if (!brotherName) {
    return NextResponse.json({ error: 'Brother name is required.' }, { status: 400 });
  }
  if (!email || !looksLikeEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
  }
  if (!quantity) {
    return NextResponse.json({ error: 'Quantity must be between 1 and 24.' }, { status: 400 });
  }
  if (!unitPrice || unitPrice <= 0) {
    return NextResponse.json({ error: 'Campaign pricing is not configured.' }, { status: 409 });
  }
  if (!allowedSizes.includes(shirtSize)) {
    return NextResponse.json({ error: 'Selected size is not available for this campaign.' }, { status: 400 });
  }

  const totalAmount = Math.round(unitPrice * quantity * 100) / 100;

  try {
    // Single-statement insert — Postgres auto-commits it atomically, no explicit transaction needed.
    const { rows: inserted } = await execute(
      `INSERT INTO campaign_orders
       (campaign_id, brother_name, email, phone, shirt_size, quantity, unit_price, total_amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       RETURNING id`,
      [campaign.id, brotherName, email, phone, shirtSize, quantity, unitPrice, totalAmount, notes],
    );

    await logFundActivity(
      'order',
      `Recorded T-shirt order for ${campaign.name}: ${brotherName} x${quantity} (${shirtSize})`,
    );
    publishAdminRealtime('orders');

    return NextResponse.json({
      success: true,
      orderId: Number(inserted[0]?.id ?? 0),
      totalAmount,
      message: `Your order for ${campaign.name} has been recorded.`,
    });
  } catch (error) {
    console.error('[api/campaigns/[slug]/orders] POST failed:', error);
    return NextResponse.json({ error: 'Could not record the order.' }, { status: 500 });
  }
}
