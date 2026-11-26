'use client';

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from 'chart.js';
import { useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const WEEKS = 8;

function weeklyCounts(dates: Array<string | undefined>, now: number) {
  const counts = new Array<number>(WEEKS).fill(0);
  for (const value of dates) {
    const t = value ? new Date(value).getTime() : NaN;
    if (Number.isNaN(t)) continue;
    const weeksAgo = Math.floor((now - t) / WEEK_MS);
    if (weeksAgo >= 0 && weeksAgo < WEEKS) counts[WEEKS - 1 - weeksAgo] += 1;
  }
  return counts;
}

/** Petitions and newsletter signups per week over the last eight weeks. */
export function ActivityChart({
  petitionDates,
  subscriberDates,
}: {
  petitionDates: Array<string | undefined>;
  subscriberDates: Array<string | undefined>;
}) {
  const [now] = useState(() => Date.now());
  const data = useMemo(() => {
    const labels = Array.from({ length: WEEKS }, (_, i) => {
      const start = new Date(now - (WEEKS - i) * WEEK_MS + 1);
      return start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
    });
    return {
      labels,
      datasets: [
        {
          label: 'Petitions',
          data: weeklyCounts(petitionDates, now),
          backgroundColor: 'rgba(212, 175, 55, 0.85)',
          borderRadius: 6,
          maxBarThickness: 18,
        },
        {
          label: 'Subscribers',
          data: weeklyCounts(subscriberDates, now),
          backgroundColor: 'rgba(163, 25, 44, 0.85)',
          borderRadius: 6,
          maxBarThickness: 18,
        },
      ],
    };
  }, [petitionDates, subscriberDates, now]);

  return (
    <div className="h-[230px]">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: { color: 'rgba(241,235,224,0.6)', boxWidth: 10, boxHeight: 10, font: { size: 11 } },
            },
            tooltip: { backgroundColor: '#1e1518', borderColor: 'rgba(212,175,55,0.3)', borderWidth: 1 },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: 'rgba(241,235,224,0.45)', font: { size: 10 } } },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: 'rgba(241,235,224,0.45)', precision: 0, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  );
}
