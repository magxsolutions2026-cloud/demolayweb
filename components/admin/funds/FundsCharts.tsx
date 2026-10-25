'use client';

import { useMemo } from 'react';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const grid = 'rgba(255,255,255,0.06)';
const text = 'rgba(255,255,255,0.55)';
const gold = 'rgba(212, 175, 55, 0.95)';
const goldFill = 'rgba(212, 175, 55, 0.12)';
const rose = 'rgba(244, 114, 182, 0.9)';
const roseFill = 'rgba(244, 114, 182, 0.08)';

const pieColors = [
  'rgba(212, 175, 55, 0.9)',
  'rgba(96, 165, 250, 0.85)',
  'rgba(52, 211, 153, 0.85)',
  'rgba(167, 139, 250, 0.85)',
  'rgba(251, 146, 60, 0.85)',
  'rgba(148, 163, 184, 0.7)',
];

export type MonthlyPoint = { month: string; raised: number; disbursed: number };
export type TypeSlice = { type: string; amount: number };
export type CategorySlice = { category: string; amount: number };

export function FundsCharts({
  monthlySeries,
  sourcesByType,
  disbursementsByCategory,
}: {
  monthlySeries: MonthlyPoint[];
  sourcesByType: TypeSlice[];
  disbursementsByCategory: CategorySlice[];
}) {
  const lineData = useMemo(() => {
    const labels = monthlySeries.map((m) => m.month);
    return {
      labels,
      datasets: [
        {
          label: 'Funds raised',
          data: monthlySeries.map((m) => m.raised),
          borderColor: gold,
          backgroundColor: goldFill,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Disbursements',
          data: monthlySeries.map((m) => m.disbursed),
          borderColor: rose,
          backgroundColor: roseFill,
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [monthlySeries]);

  const pieData = useMemo(() => {
    const labels = sourcesByType.map((s) => labelizeType(s.type));
    return {
      labels,
      datasets: [
        {
          data: sourcesByType.map((s) => s.amount),
          backgroundColor: pieColors.slice(0, Math.max(labels.length, 1)),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };
  }, [sourcesByType]);

  const barData = useMemo(() => {
    const labels = disbursementsByCategory.map((c) => c.category || '—');
    return {
      labels,
      datasets: [
        {
          label: 'Amount',
          data: disbursementsByCategory.map((c) => c.amount),
          backgroundColor: labels.map((_, i) => pieColors[i % pieColors.length]),
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };
  }, [disbursementsByCategory]);

  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: text, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 12, 20, 0.94)',
        titleColor: 'rgba(255,255,255,0.9)',
        bodyColor: 'rgba(255,255,255,0.75)',
        borderColor: 'rgba(212,175,55,0.25)',
        borderWidth: 1,
        padding: 10,
      },
    },
  };

  const emptyPie = sourcesByType.every((s) => Number(s.amount) === 0);
  const emptyBar = disbursementsByCategory.length === 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="border-gold/20 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl border p-4 shadow-lg shadow-black/20">
        <p className="text-gold/85 mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">Trend</p>
        <div className="relative h-64 w-full">
          <Line
            data={lineData}
            options={{
              ...commonOpts,
              scales: {
                x: {
                  grid: { color: grid },
                  ticks: { color: text, maxRotation: 45, minRotation: 0 },
                },
                y: {
                  grid: { color: grid },
                  ticks: { color: text },
                },
              },
            }}
          />
        </div>
        <p className="text-foreground/45 mt-2 text-center text-[11px]">Funds raised vs disbursements by month</p>
      </div>

      <div className="border-gold/20 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl border p-4 shadow-lg shadow-black/20">
        <p className="text-gold/85 mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">Fund sources</p>
        <div className="relative mx-auto h-64 w-full max-w-sm">
          {emptyPie ? (
            <p className="text-foreground/45 flex h-full items-center justify-center text-sm">No fund source data yet</p>
          ) : (
            <Pie
              data={pieData}
              options={{
                ...commonOpts,
                plugins: {
                  ...commonOpts.plugins,
                  legend: { position: 'right' as const, labels: { color: text, boxWidth: 12 } },
                },
              }}
            />
          )}
        </div>
        <p className="text-foreground/45 mt-2 text-center text-[11px]">Distribution by source type</p>
      </div>

      <div className="border-gold/20 bg-gradient-to-br from-white/[0.06] to-transparent rounded-2xl border p-4 shadow-lg shadow-black/20 lg:col-span-2">
        <p className="text-gold/85 mb-3 text-[11px] font-bold uppercase tracking-[0.16em]">Disbursements by category</p>
        <div className="relative h-64 w-full">
          {emptyBar ? (
            <p className="text-foreground/45 flex h-full items-center justify-center text-sm">No disbursements yet</p>
          ) : (
            <Bar
              data={barData}
              options={{
                ...commonOpts,
                scales: {
                  x: {
                    grid: { display: false },
                    ticks: { color: text },
                  },
                  y: {
                    grid: { color: grid },
                    ticks: { color: text },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function labelizeType(t: string): string {
  const map: Record<string, string> = {
    donations: 'Donations',
    events: 'Events',
    contributions: 'Contributions',
    sponsors: 'Sponsors',
    other: 'Other',
  };
  return map[t] || t;
}
