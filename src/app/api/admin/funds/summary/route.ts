import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

type Row = Record<string, unknown>;

export async function GET(request: Request) {
  await requireAdmin(request);

  try {
    const [inRows] = (await query(
      'SELECT COALESCE(SUM(amount),0) as s FROM fund_sources',
    )) as Row[];
    const [orderRows] = (await query(
      'SELECT COALESCE(SUM(total_amount),0) as s FROM campaign_orders',
    )) as Row[];
    const [outRows] = (await query(
      'SELECT COALESCE(SUM(amount),0) as s FROM disbursements',
    )) as Row[];

    const orderTotal = Number(orderRows?.s ?? 0);
    const totalRaised = Number(inRows?.s ?? 0) + orderTotal;
    const totalDisbursed = Number(outRows?.s ?? 0);
    const balance = totalRaised - totalDisbursed;

    const [campRows] = (await query(
      `SELECT COUNT(*) as c FROM campaigns 
       WHERE status = 'active' AND CURDATE() BETWEEN start_date AND end_date`,
    )) as Row[];
    const activeCampaigns = Number(campRows?.c ?? 0);

    const raisedByMonth = (await query(
      `SELECT DATE_FORMAT(source_date, '%Y-%m') as ym, COALESCE(SUM(amount),0) as total
       FROM fund_sources
       WHERE source_date >= DATE_SUB(CURDATE(), INTERVAL 14 MONTH)
       GROUP BY ym ORDER BY ym`,
    )) as Array<{ ym: string; total: number }>;

    const orderByMonth = (await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') as ym, COALESCE(SUM(total_amount),0) as total
       FROM campaign_orders
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 MONTH)
       GROUP BY ym ORDER BY ym`,
    )) as Array<{ ym: string; total: number }>;

    const disbByMonth = (await query(
      `SELECT DATE_FORMAT(disbursement_date, '%Y-%m') as ym, COALESCE(SUM(amount),0) as total
       FROM disbursements
       WHERE disbursement_date >= DATE_SUB(CURDATE(), INTERVAL 14 MONTH)
       GROUP BY ym ORDER BY ym`,
    )) as Array<{ ym: string; total: number }>;

    const bySource = (await query(
      `SELECT source_type as type, COALESCE(SUM(amount),0) as total FROM fund_sources GROUP BY source_type`,
    )) as Array<{ type: string; total: number }>;

    const byCategory = (await query(
      `SELECT category, COALESCE(SUM(amount),0) as total FROM disbursements GROUP BY category`,
    )) as Array<{ category: string; total: number }>;

    const months = new Set<string>();
    raisedByMonth.forEach((r) => months.add(r.ym));
    orderByMonth.forEach((r) => months.add(r.ym));
    disbByMonth.forEach((r) => months.add(r.ym));
    const sorted = [...months].sort();

    const raisedMap = Object.fromEntries(raisedByMonth.map((r) => [r.ym, Number(r.total)]));
    orderByMonth.forEach((row) => {
      raisedMap[row.ym] = Number(raisedMap[row.ym] ?? 0) + Number(row.total);
    });
    const disbMap = Object.fromEntries(disbByMonth.map((r) => [r.ym, Number(r.total)]));

    const monthlySeries = sorted.map((ym) => ({
      month: ym,
      raised: raisedMap[ym] ?? 0,
      disbursed: disbMap[ym] ?? 0,
    }));

    const activity = (await query(
      `SELECT id, action_type, message, created_at FROM fund_activity ORDER BY id DESC LIMIT 30`,
    )) as Array<{ id: number; action_type: string; message: string; created_at: string }>;

    return NextResponse.json({
      balance,
      totalRaised,
      totalDisbursed,
      activeCampaigns,
      monthlySeries,
      sourcesByType: [
        ...bySource.map((r) => ({ type: r.type, amount: Number(r.total) })),
        ...(orderTotal > 0 ? [{ type: 'merchandise', amount: orderTotal }] : []),
      ],
      disbursementsByCategory: byCategory.map((r) => ({ category: r.category, amount: Number(r.total) })),
      activity,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: 'Funds tables may be missing. Run db-migration-funds.sql and db-migration-tshirt-campaign-orders.sql on your database.' },
      { status: 500 },
    );
  }
}
