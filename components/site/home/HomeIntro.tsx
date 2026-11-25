import Link from 'next/link';
import { HandHeart, Shield, Users } from 'lucide-react';
import JoinButton from './JoinButton';
import SectionHeading from './SectionHeading';

const PILLARS = [
  {
    icon: Shield,
    title: 'Leadership',
    text: 'Members run their own meetings, projects and events, learning to lead by doing.',
  },
  {
    icon: Users,
    title: 'Brotherhood',
    text: 'Lasting friendships built on respect, loyalty and shared values.',
  },
  {
    icon: HandHeart,
    title: 'Service',
    text: 'Projects that give back to families, the lodge and the community of Ilagan.',
  },
] as const;

/** "Who we are": what DeMolay is, the chapter motto, and three pillars. */
export default function HomeIntro() {
  return (
    <section id="about-chapter" className="home-section" aria-labelledby="intro-heading">
      <div className="home-container grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div className="reveal">
          <SectionHeading
            id="intro-heading"
            eyebrow="Who we are"
            title={
              <>
                Timeless Devotion,
                <br />
                <span className="text-foreground/55">Lasting Camaraderie.</span>
              </>
            }
          />
          <p className="mt-6 max-w-xl text-base leading-relaxed text-foreground/70 md:text-lg">
            DeMolay is a youth leadership organization for young men ages 12 to 21. At T. De Leon Chapter No. 47 in
            Ilagan City, Isabela, members grow in character, discipline and service through real chapter life.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <JoinButton />
            <Link href="/about" className="cta-ghost text-sm uppercase tracking-[0.18em]">
              Our story
            </Link>
          </div>
        </div>

        <ul className="grid gap-4">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="reveal glass flex items-start gap-5 rounded-[var(--frame-radius)] p-6">
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 text-gold">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div className="relative z-10">
                <h3 className="font-serif text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/65">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
