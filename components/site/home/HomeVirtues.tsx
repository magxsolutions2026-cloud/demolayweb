import SectionHeading from './SectionHeading';

const VIRTUES = [
  { name: 'Filial Love', desc: 'Love and respect for parents, who nurture us and teach life’s lessons.' },
  { name: 'Reverence for Sacred Things', desc: 'Faith in a higher being, with respect for the beliefs of others.' },
  { name: 'Courtesy', desc: 'Kindness and respect for friends, family and strangers alike.' },
  { name: 'Comradeship', desc: 'Faithful friendship that stands by brothers in good times and hard times.' },
  { name: 'Fidelity', desc: 'Loyalty to values, friends, duty and country, as Jacques DeMolay showed.' },
  { name: 'Cleanness', desc: 'Purity in thought, word and deed: a clean mind, body and conscience.' },
  { name: 'Patriotism', desc: 'Serving as a good citizen and honoring our country and flag.' },
] as const;

/** Seven Cardinal Virtues as numbered metal plates: one row on desktop, swipeable on phones. */
export default function HomeVirtues() {
  return (
    <section id="virtues" className="home-section" aria-labelledby="virtues-heading">
      <div className="home-container">
        <div className="reveal">
          <SectionHeading
            id="virtues-heading"
            eyebrow="Seven Cardinal Virtues"
            title="The principles we live by."
            subtitle="Lived in thought, word and deed, in the chapter and beyond."
          />
        </div>

        <ol className="no-scrollbar -mx-4 mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:grid lg:grid-cols-7 lg:gap-3 lg:overflow-visible lg:px-0">
          {VIRTUES.map((virtue, index) => (
            <li key={virtue.name} className="virtue-plate reveal w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-auto">
              <span className="font-mono text-xs tracking-[0.2em] text-gold/70">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="font-serif mt-6 text-lg font-bold leading-snug text-white">{virtue.name}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/60">{virtue.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
