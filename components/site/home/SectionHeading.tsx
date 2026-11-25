/** Shared landing-page section heading: gold eyebrow, serif title, one-line subtitle. */
export default function SectionHeading({
  id,
  eyebrow,
  title,
  subtitle,
  align = 'left',
}: {
  id?: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'left' | 'center';
}) {
  return (
    <div className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="inline-flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.24em] text-gold/85 md:text-xs">
        <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_#d4af37]" aria-hidden />
        {eyebrow}
      </p>
      <h2 id={id} className="font-serif mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-4 text-base leading-relaxed text-foreground/60 md:text-lg">{subtitle}</p> : null}
    </div>
  );
}
