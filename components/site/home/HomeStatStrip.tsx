const STATS = [
  { value: '12–21', label: 'Ages welcome' },
  { value: 'Ilagan', label: 'City of Isabela' },
  { value: '113', label: 'Chapters in the Philippines' },
  { value: 'TDLC', label: 'Timeless Devotion, Lasting Camaraderie' },
] as const;

/** Slim fact strip right under the hero. */
export default function HomeStatStrip() {
  return (
    <div className="home-container">
      <dl className="reveal grid grid-cols-2 border-y border-foreground/10 md:grid-cols-4">
        {STATS.map((stat, index) => (
          <div
            key={stat.label}
            className={`flex flex-col px-4 py-6 md:px-6 md:py-8 ${index % 2 === 1 ? 'border-l border-foreground/10' : ''} ${
              index > 1 ? 'border-t border-foreground/10 md:border-t-0' : ''
            } ${index === 2 ? 'md:border-l' : ''}`}
          >
            <dt className="order-2 mt-1 text-xs uppercase tracking-[0.16em] text-foreground/50">{stat.label}</dt>
            <dd className="font-serif order-1 text-3xl font-bold text-gold md:text-4xl">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
