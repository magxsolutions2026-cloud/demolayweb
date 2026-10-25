import { officerPhotoBackgroundStyle } from '@/lib/officerPhoto';
import { listOfficersOrderedByName } from '@/lib/officersDb';

export const dynamic = 'force-dynamic';

async function fetchOfficers() {
  try {
    return await listOfficersOrderedByName();
  } catch {
    return [];
  }
}

export default async function OfficersPage() {
  const officers = await fetchOfficers();

  return (
    <main className="px-6 py-28 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Leadership</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Chapter officers</h1>
        <p className="text-foreground/65 mt-3 max-w-2xl text-lg">
          Meet the young men who steward our chapter programs and ritual work.
        </p>
        {officers.length > 0 ? (
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {officers.map((officer) => (
              <article
                key={officer.id}
                className="glass glass-card-lift group flex h-full min-w-0 flex-col rounded-2xl border border-gold/25 p-5"
              >
                <div className="relative mb-3 aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-800">
                  <div
                    className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] will-change-transform group-hover:scale-[1.04]"
                    style={officerPhotoBackgroundStyle(officer)}
                  />
                </div>
                <h2 className="font-serif text-xl font-semibold transition-colors duration-300 group-hover:text-gold/95">
                  {officer.name}
                </h2>
                <p className="text-sm text-gold">{officer.position}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass mt-12 rounded-2xl border border-gold/20 px-6 py-8">
            <p className="font-serif text-2xl">No officers available yet.</p>
            <p className="text-foreground/65 mt-2 max-w-xl">
              If officers exist in the admin dashboard, refresh this page after the latest changes load.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
