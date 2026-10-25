import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

type OrderRow = {
  id: number;
  campaign_id: number;
  campaign_name: string;
  campaign_slug: string | null;
  brother_name: string;
  email: string;
  phone: string | null;
  shirt_size: string;
  quantity: number;
  unit_price: number | string;
  total_amount: number | string;
  notes: string | null;
  created_at: string;
};

export async function GET(request: Request) {
  await requireAdmin(request);

  const orders = await query<OrderRow>(
    `SELECT o.id, o.campaign_id, c.name AS campaign_name, c.slug AS campaign_slug,
            o.brother_name, o.email, o.phone, o.shirt_size, o.quantity, o.unit_price, o.total_amount, o.notes, o.created_at
     FROM campaign_orders o
     INNER JOIN campaigns c ON c.id = o.campaign_id
     ORDER BY o.created_at DESC, o.id DESC`,
  );

  const totals = await query<{ total_orders: number; total_shirts: number | string; total_collected: number | string }>(
    `SELECT COUNT(*) AS total_orders,
            COALESCE(SUM(quantity), 0) AS total_shirts,
            COALESCE(SUM(total_amount), 0) AS total_collected
     FROM campaign_orders`,
  );

  const sizes = await query<{ shirt_size: string; quantity: number | string }>(
    `SELECT shirt_size, COALESCE(SUM(quantity), 0) AS quantity
     FROM campaign_orders
     GROUP BY shirt_size
     ORDER BY shirt_size ASC`,
  );

  const summary = Array.isArray(totals) && totals.length > 0 ? totals[0] : null;

  return NextResponse.json({
    orders,
    summary: {
      totalOrders: Number(summary?.total_orders ?? 0),
      totalShirts: Number(summary?.total_shirts ?? 0),
      totalCollected: Number(summary?.total_collected ?? 0),
      sizeBreakdown: sizes.map((row) => ({
        size: row.shirt_size,
        quantity: Number(row.quantity ?? 0),
      })),
    },
  });
}
