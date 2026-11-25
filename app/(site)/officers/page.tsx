import OfficersCarousel from '@/components/site/OfficersCarousel';
import { listOfficersOrderedByName } from '@/lib/officersDb';

/** Cached and refreshed in the background at most once a minute, so navigation is instant. */
export const revalidate = 60;

async function fetchOfficers() {
  try {
    return await listOfficersOrderedByName();
  } catch {
    return [];
  }
}

export default async function OfficersPage() {
  const officers = await fetchOfficers();

  const heading = (
    <>
      <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">Leadership</p>
      <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Chapter officers</h1>
      <p className="text-foreground/65 mt-3 max-w-2xl text-lg">
        Meet the young men who steward our chapter programs and ritual work.
      </p>
    </>
  );

  if (officers.length > 0) {
    return (
      <main>
        <OfficersCarousel officers={officers}>{heading}</OfficersCarousel>
      </main>
    );
  }

  return (
    <main className="px-6 py-28 md:px-10 md:py-32">
      <div className="mx-auto max-w-6xl">
        {heading}
        <div className="glass mt-12 rounded-2xl border border-gold/20 px-6 py-8">
          <p className="font-serif text-2xl">No officers available yet.</p>
          <p className="text-foreground/65 mt-2 max-w-xl">
            If officers exist in the admin dashboard, refresh this page after the latest changes load.
          </p>
        </div>
      </div>
    </main>
  );
}
