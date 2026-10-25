import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const LEGACY_ABOUT_TEXT =
  'We are young men committed to the seven Cardinal Virtues: Filial love, Reverence for sacred things, Courtesy, Comradeship, Fidelity, Cleanness, and Patriotism. Our chapter meets regularly for ritual, service projects, and leadership development. Whether you are exploring membership or reconnecting with DeMolay, you will find a welcoming circle rooted in Masonic tradition and modern purpose.';

const DEFAULT_ABOUT_TEXT =
  'T. De Leon Chapter No. 47 is a place where young men learn discipline, leadership, and service through real chapter life. We focus on teamwork, character, and responsibility — from meetings and service projects to mentoring and public community work. If you are new to DeMolay or coming back to reconnect, you will find a chapter that values respect, purpose, and brotherhood in action.';

const CHAPTER_HISTORY_TITLE = 'T. De Leon Chapter History';
const CHAPTER_HISTORY_SOURCE = 'Verbatim transcription from chapter notes';
const CHAPTER_HISTORY_TRANSCRIPT = [
  'T. De Leon was the late father of Dr. Ogyidio De Leon , The man behind why T. De Leon chapter was Established',
  '1985 when Dr. Ogyidio De Leon sponsored to create a DeMolay chapter here in the City of Ilagan , Isabela , for his generosity, he offered some cash assistance to the chapter members of DeMolay here in Ilagan , and as a debt of gratitude to Dr. De leon they named the chapter to his beloved father',
  'his fathers name is Teodoro De Leon',
  '1986 when the first public installation was conducted here in Ilagan and every year there was an installation. September 21 , 1986 when the T. De Leon chapter Order of DeMolay was established',
];

const BROTHER_SPOTLIGHT = {
  name: 'Mark Angelo H. Guillermo',
  role: 'Brother and Chapter Systems Developer',
  summary:
    'Mark Angelo H. Guillermo helps the chapter move forward by translating day-to-day needs into reliable tools and clear processes.',
  details: [
    'He focuses on making information easier to manage, keeping chapter updates organized, and turning ideas into features the officers can use.',
    'His service shows that brotherhood is not only seen in ceremonies, but also in the quiet work that makes chapter life smoother for everyone.',
  ],
};

async function fetchAbout() {
  try {
    const rows = await query<{ section: string; content: string }>(
      "SELECT section, content FROM landing_content WHERE section = 'about'",
    );
    const row = Array.isArray(rows) && rows[0] ? rows[0] : null;
    if (!row) return { text: '' };
    const parsed = JSON.parse(row.content) as { text?: string };
    return { text: parsed.text || '' };
  } catch {
    return { text: '' };
  }
}

export default async function AboutPage() {
  const about = await fetchAbout();
  const rawText = about.text?.trim() || '';
  const text =
    !rawText || rawText === LEGACY_ABOUT_TEXT
      ? DEFAULT_ABOUT_TEXT
      : rawText;

  return (
    <main className="px-6 py-28 md:px-10 md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">About</p>
        <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">Our chapter</h1>
        <div className="border-gold/25 mt-10 rounded-3xl border bg-[rgba(10,10,10,0.55)] p-8 backdrop-blur-xl md:p-10">
          <p className="text-lg leading-relaxed text-foreground/85 whitespace-pre-wrap">{text}</p>
        </div>

        <section className="glass mt-8 rounded-3xl border border-gold/25 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">
                Chapter History
              </p>
              <h2 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
                {CHAPTER_HISTORY_TITLE}
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/60">
                {CHAPTER_HISTORY_SOURCE}
              </p>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-medium text-gold/90">
              Chapter Notes
            </div>
          </div>
          <div className="mt-6 space-y-6 text-base leading-8 text-foreground/84 md:text-lg">
            {CHAPTER_HISTORY_TRANSCRIPT.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="glass mt-8 rounded-3xl border border-gold/25 p-8 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <p className="text-gold mb-3 text-xs font-semibold uppercase tracking-[0.22em]">
                Brother In Service
              </p>
              <h2 className="font-serif text-2xl font-bold tracking-tight md:text-3xl">
                {BROTHER_SPOTLIGHT.name}
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground/60">
                {BROTHER_SPOTLIGHT.role}
              </p>
            </div>
            <div className="rounded-2xl border border-gold/20 bg-gold/10 px-4 py-2 text-sm font-medium text-gold/90">
              Chapter Systems Support
            </div>
          </div>
          <p className="mt-6 text-lg leading-relaxed text-foreground/85">
            {BROTHER_SPOTLIGHT.summary}
          </p>
          <div className="mt-6 space-y-4 text-base leading-relaxed text-foreground/78">
            {BROTHER_SPOTLIGHT.details.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
