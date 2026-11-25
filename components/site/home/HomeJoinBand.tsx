import Link from 'next/link';
import JoinButton from './JoinButton';

const STEPS = [
  { title: 'Send your petition', text: 'Fill in the Join Us form. It takes a few minutes.' },
  { title: 'Meet the chapter', text: 'Officers review your petition and reach out to you and your family.' },
  { title: 'Take your place', text: 'Receive your degrees and stand with your new brothers.' },
] as const;

/** "Become a DeMolay": the page's main call to action, framed like the globe capsule. */
export default function HomeJoinBand() {
  return (
    <section id="join" className="home-section" aria-labelledby="join-heading">
      <div className="home-container">
        <div className="orbit-window-frame reveal !rounded-[calc(var(--frame-radius)+12px)]">
          <div className="relative overflow-hidden rounded-[var(--frame-radius)] bg-[radial-gradient(ellipse_at_50%_0%,#0b1020,#020308_70%)] px-6 py-12 md:px-14 md:py-16">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-maroon/40 blur-3xl"
              aria-hidden
            />
            <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <p className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/85 md:text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#d4af37]" aria-hidden />
                  Become a DeMolay
                </p>
                <h2 id="join-heading" className="font-serif mt-4 text-3xl font-bold leading-[1.1] text-white md:text-5xl">
                  Ready to take
                  <br />
                  your place?
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                  Open to young men ages 12 to 21. Parents and guardians are welcome to ask us anything first.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <JoinButton />
                  <Link href="/contact" className="cta-ghost text-sm uppercase tracking-[0.18em]">
                    Ask a question
                  </Link>
                </div>
              </div>

              <ol className="grid gap-4">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <span className="font-serif flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/40 text-lg font-bold text-gold">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/60">{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
