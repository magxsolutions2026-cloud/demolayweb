import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import type { OfficerRow } from '@/lib/officersDb';
import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';
import SectionHeading from './SectionHeading';

/** Chapter offices in order of rank; unknown positions follow alphabetically. */
const RANK = [
  'master councilor',
  'senior councilor',
  'junior councilor',
  'scribe',
  'treasurer',
  'chaplain',
  'senior deacon',
  'junior deacon',
];

function rankOf(position: string) {
  const index = RANK.indexOf(position.trim().toLowerCase());
  return index === -1 ? RANK.length : index;
}

/** Officer teaser: up to eight faces in order of rank, linking to the full officers page. */
export default function HomeOfficers({ officers }: { officers: OfficerRow[] }) {
  if (!officers.length) return null;
  const shown = [...officers]
    .sort((a, b) => rankOf(a.position) - rankOf(b.position) || a.position.localeCompare(b.position))
    .slice(0, 8);

  return (
    <section id="officers" className="home-section" aria-labelledby="officers-heading">
      <div className="home-container">
        <div className="reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="officers-heading"
            eyebrow="Leadership"
            title="Meet the officers."
            subtitle="The members elected to lead the chapter this term."
          />
          <Link href="/officers" className="inline-flex items-center gap-1.5 text-sm text-gold transition hover:text-amber-200">
            All officers <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((officer) => (
            <li key={officer.id} className="reveal glass group overflow-hidden rounded-[var(--frame-radius)]">
              <div
                className="relative aspect-[4/5] w-full transition duration-500 group-hover:scale-[1.03]"
                style={officerPhotoBackgroundStyle(officer)}
                role="img"
                aria-label={officer.name}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-gold">{officer.position}</p>
                  <p className="font-serif mt-1 text-lg font-bold leading-tight text-white">{officer.name}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
