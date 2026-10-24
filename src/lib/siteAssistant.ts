import { LODGE_ADDRESS, googleMapsLodgeUrl, googleStreetViewOpenUrl } from '@/lib/lodgeLocation';

export type SiteAssistantAction =
  | { kind: 'join'; label: string }
  | { kind: 'navigate'; label: string; href: string }
  | { kind: 'external'; label: string; href: string };

export type SiteAssistantReply = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
  actions?: SiteAssistantAction[];
  suggestedPrompts?: string[];
};

type KnowledgeEntry = SiteAssistantReply & {
  id: string;
  keywords: string[];
};

const CONTACT_EMAIL = 'tdeleonchapter47@gmail.com' as const;

const JOIN_ACTION: SiteAssistantAction = { kind: 'join', label: 'Open Join Us' };
const ABOUT_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'About the chapter', href: '/about' };
const EVENTS_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'View events', href: '/events' };
const NEWS_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'Read news', href: '/news' };
const OFFICERS_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'Meet the officers', href: '/officers' };
const CONTACT_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'Contact the chapter', href: '/contact' };
const FEED_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'See the chapter feed', href: '/#feed' };
const NEWSLETTER_ACTION: SiteAssistantAction = { kind: 'navigate', label: 'Go to newsletter', href: '/#newsletter' };
const MAPS_ACTION: SiteAssistantAction = { kind: 'external', label: 'Open Google Maps', href: googleMapsLodgeUrl };
const STREET_VIEW_ACTION: SiteAssistantAction = {
  kind: 'external',
  label: 'Open Street View',
  href: googleStreetViewOpenUrl,
};

export const SITE_ASSISTANT_STARTERS = [
  'What is DeMolay?',
  'How do I join?',
  'Where is the lodge?',
  'What are the Seven Cardinal Virtues?',
] as const;

const WELCOME_REPLY: SiteAssistantReply = {
  title: 'Welcome to T. De Leon Chapter No. 47',
  paragraphs: [
    'I am the public website guide for the chapter. I can help you understand DeMolay, the chapter, joining, events, news, fundraising campaigns, the Seven Cardinal Virtues, and how to visit or contact the lodge.',
    'If you are a prospective member, parent, supporter, or guest, ask naturally and I will keep the answer clear and grounded in the public site.',
  ],
  actions: [JOIN_ACTION, EVENTS_ACTION, CONTACT_ACTION],
  suggestedPrompts: [...SITE_ASSISTANT_STARTERS],
};

const FALLBACK_REPLY: SiteAssistantReply = {
  title: 'I can help with the public side of the chapter',
  paragraphs: [
    'I can best help with DeMolay, T. De Leon Chapter No. 47, how to join, lodge location, chapter history, events, news, fundraising campaigns, officers, virtues, and newsletter updates.',
    'If your question is broader, try asking it in a simpler way and I will guide you to the closest section of the website.',
  ],
  actions: [FEED_ACTION, JOIN_ACTION, CONTACT_ACTION],
  suggestedPrompts: ['Tell me about the chapter', 'What events do you have?', 'How can supporters help?', 'How do I contact the chapter?'],
};

const KNOWLEDGE_ENTRIES: KnowledgeEntry[] = [
  {
    id: 'site-guide',
    title: 'How I can help',
    keywords: ['what can you do', 'what can i ask', 'help me', 'website', 'site', 'who are you', 'where should i start'],
    paragraphs: [
      'This website is the public home of T. De Leon Chapter No. 47, Order of DeMolay. I can guide you through the chapter feed, public routes, joining, chapter background, virtues, events, news, campaigns, and contact details.',
      'If you want the fastest starting point, the landing page highlights the chapter identity, current feed, Seven Cardinal Virtues, lodge location, and newsletter signup.',
    ],
    actions: [FEED_ACTION, JOIN_ACTION, NEWSLETTER_ACTION],
    suggestedPrompts: ['What is DeMolay?', 'Tell me about the chapter', 'Where is the lodge?', 'How do I join?'],
  },
  {
    id: 'demolay',
    title: 'What DeMolay is',
    keywords: ['what is demolay', 'demolay', 'youth organization', 'ages 12 21', 'leadership organization', 'brotherhood'],
    paragraphs: [
      'DeMolay is a youth leadership organization for young men ages 12 to 21. It focuses on brotherhood, leadership, character development, service, responsibility, and preparing young men to become capable community leaders.',
      'The chapter presents DeMolay as more than a club. It is a values-based experience built around growth, discipline, fellowship, service, and leadership opportunities.',
    ],
    bullets: ['Brotherhood', 'Leadership', 'Character', 'Service'],
    actions: [ABOUT_ACTION, JOIN_ACTION, OFFICERS_ACTION],
    suggestedPrompts: ['What are the Seven Cardinal Virtues?', 'How do I join?', 'Tell me about the chapter', 'Is this good for parents to know?'],
  },
  {
    id: 'chapter',
    title: 'About T. De Leon Chapter No. 47',
    keywords: ['t de leon', 't deleon', 'chapter no 47', 'tell me about the chapter', 'your chapter', 'ilagan', 'isabela chapter'],
    paragraphs: [
      'T. De Leon Chapter No. 47 is a DeMolay chapter in Ilagan City, Isabela. The public site presents the chapter as respectful, active, youth-focused, and centered on leadership, service, tradition, and character formation.',
      'Its public identity is captured by the theme “Timeless Devotion Lasting Camaraderie,” with a visitor experience built around learning, joining, following chapter activity, and staying connected.',
    ],
    actions: [ABOUT_ACTION, OFFICERS_ACTION, FEED_ACTION],
    suggestedPrompts: ['What is DeMolay?', 'What is your chapter history?', 'Where is the lodge?', 'How can I join?'],
  },
  {
    id: 'join',
    title: 'How to join',
    keywords: ['join', 'membership', 'apply', 'petition', 'become a member', 'how do i join', 'join us'],
    paragraphs: [
      'The public website uses a “Join Us” flow for membership inquiries and petitions. A visitor can open the Join Us form directly from the site and submit their information for chapter review.',
      'If someone is exploring membership, the safest public guidance is to use the Join Us option first, then follow any chapter response. If a family has questions before applying, the contact page is the next best step.',
    ],
    actions: [JOIN_ACTION, CONTACT_ACTION],
    suggestedPrompts: ['What is DeMolay?', 'Is this for parents too?', 'Where is the lodge?', 'Tell me about the chapter'],
  },
  {
    id: 'parents',
    title: 'For parents and families',
    keywords: ['parent', 'parents', 'family', 'families', 'my son', 'benefits', 'is this good', 'safe'],
    paragraphs: [
      'For parents, the website frames DeMolay as a youth leadership and character-building organization. The emphasis is on brotherhood, responsibility, service, discipline, leadership growth, and strong values.',
      'A helpful next step for families is to learn what DeMolay is, review the chapter background, and use the Join Us or contact options for membership questions.',
    ],
    actions: [JOIN_ACTION, ABOUT_ACTION, CONTACT_ACTION],
    suggestedPrompts: ['What is DeMolay?', 'How do I join?', 'What are the Seven Cardinal Virtues?', 'Where is the lodge?'],
  },
  {
    id: 'virtues',
    title: 'The Seven Cardinal Virtues',
    keywords: ['virtues', 'seven cardinal virtues', 'values', 'filial love', 'courtesy', 'patriotism', 'fidelity'],
    paragraphs: [
      'The landing page highlights the Seven Cardinal Virtues of DeMolay as the moral foundation of chapter life. They are presented as principles to live in thought, word, and deed.',
    ],
    bullets: [
      'Filial Love: love and respect for parents.',
      'Reverence for Sacred Things: faith and respect for spiritual belief.',
      'Courtesy: kindness and respect toward others.',
      'Comradeship: faithful friendship and brotherhood.',
      'Fidelity: loyalty to values, duty, and country.',
      'Cleanness: purity in thought, word, and action.',
      'Patriotism: honoring and serving one’s country well.',
    ],
    actions: [ABOUT_ACTION, JOIN_ACTION],
    suggestedPrompts: ['What is DeMolay?', 'Tell me about the chapter', 'How do I join?', 'What is your chapter history?'],
  },
  {
    id: 'events',
    title: 'Events and calendar',
    keywords: ['events', 'event', 'calendar', 'schedule', 'degree', 'service project', 'activities'],
    paragraphs: [
      'The public site has a dedicated Events page for chapter activities, degrees, and service projects. The landing page chapter feed also surfaces event highlights alongside news and campaigns.',
      'If you want the most direct route for public event browsing, the Events page is the clearest destination.',
    ],
    actions: [EVENTS_ACTION, FEED_ACTION],
    suggestedPrompts: ['Do you have news too?', 'How can I stay updated?', 'Where is the lodge?', 'Tell me about the chapter'],
  },
  {
    id: 'news',
    title: 'News and announcements',
    keywords: ['news', 'announcement', 'announcements', 'stories', 'updates', 'bulletin'],
    paragraphs: [
      'The website includes a News & Announcements page and also features updates inside the landing-page chapter feed. This is where visitors can follow public chapter stories, announcements, and recent updates.',
      'If someone asks what is happening now, the chapter feed and the news page are the best public sources on the site.',
    ],
    actions: [NEWS_ACTION, FEED_ACTION],
    suggestedPrompts: ['What events do you have?', 'Do you have fundraisers?', 'How can I stay updated?', 'Tell me about the chapter'],
  },
  {
    id: 'campaigns',
    title: 'Fundraising campaigns',
    keywords: ['campaign', 'campaigns', 'fundraiser', 'fundraising', 'support', 'donate', 'shirt', 'tshirt', 'order now'],
    paragraphs: [
      'The chapter feed also features active fundraising campaigns, including campaign cards that help supporters understand current public fundraising efforts.',
      'If a supporter wants to help, the campaign area of the chapter feed is the most relevant place to start on the public site.',
    ],
    actions: [FEED_ACTION, NEWS_ACTION, CONTACT_ACTION],
    suggestedPrompts: ['What events do you have?', 'How can supporters help?', 'Where is the lodge?', 'How do I contact the chapter?'],
  },
  {
    id: 'location',
    title: 'Lodge location and contact',
    keywords: ['where', 'location', 'address', 'lodge', 'map', 'street view', 'visit', 'contact', 'email', 'phone', 'reach'],
    paragraphs: [
      `The public lodge location shown on the site is ${LODGE_ADDRESS}. The contact page lists ${CONTACT_EMAIL} for chapter inquiries and also provides direct links for maps and Street View.`,
      'Visitors can use Google Maps, Street View, or the contact page depending on whether they want directions, a visual reference, or a direct inquiry.',
    ],
    actions: [CONTACT_ACTION, MAPS_ACTION, STREET_VIEW_ACTION],
    suggestedPrompts: ['How do I join?', 'Tell me about the chapter', 'What events do you have?', 'How can I stay updated?'],
  },
  {
    id: 'officers',
    title: 'Chapter officers',
    keywords: ['officer', 'officers', 'leaders', 'leadership team', 'chapter officers'],
    paragraphs: [
      'The public Officers page introduces the young men who help steward chapter programs and ritual work. It is the best page for visitors who want to see the chapter’s visible youth leadership team.',
    ],
    actions: [OFFICERS_ACTION, ABOUT_ACTION],
    suggestedPrompts: ['Tell me about the chapter', 'What is DeMolay?', 'How do I join?', 'Where is the lodge?'],
  },
  {
    id: 'history',
    title: 'Chapter history',
    keywords: ['history', 'founded', 'established', '1985', '1986', 'teodoro', 'ogyidio', 'why is it called t de leon'],
    paragraphs: [
      'According to chapter notes presented on the site, the chapter was sponsored in 1985 in Ilagan, Isabela through the generosity of Dr. Ogyidio De Leon.',
      'The chapter was named in honor of his late father, Teodoro De Leon.',
      'The chapter notes also say the chapter was established on September 21, 1986, following the first public installation period in 1986.',
    ],
    actions: [ABOUT_ACTION, CONTACT_ACTION],
    suggestedPrompts: ['Tell me about the chapter', 'What is DeMolay?', 'How do I join?', 'Where is the lodge?'],
  },
  {
    id: 'newsletter',
    title: 'Newsletter and updates',
    keywords: ['newsletter', 'subscribe', 'updates', 'stay updated', 'milestones', 'email updates'],
    paragraphs: [
      'The landing page includes a newsletter signup for visitors who want updates about events, announcements, and chapter milestones.',
      'If someone wants to follow along without asking for direct contact first, the newsletter area on the home page is the best public option.',
    ],
    actions: [NEWSLETTER_ACTION, NEWS_ACTION, EVENTS_ACTION],
    suggestedPrompts: ['What events do you have?', 'Do you have news too?', 'How do I contact the chapter?', 'How do I join?'],
  },
];

function normalizeInput(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function keywordScore(question: string, keyword: string): number {
  if (!question.includes(keyword)) return 0;
  return keyword.includes(' ') ? 3 : 1;
}

function dedupeActions(actions: SiteAssistantAction[]): SiteAssistantAction[] {
  const seen = new Set<string>();
  return actions.filter((action) => {
    const key = `${action.kind}:${action.label}:${'href' in action ? action.href : ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupePrompts(prompts: string[]): string[] {
  const seen = new Set<string>();
  return prompts.filter((prompt) => {
    const key = prompt.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function createWelcomeReply(): SiteAssistantReply {
  return WELCOME_REPLY;
}

export function resolveSiteAssistantReply(input: string): SiteAssistantReply {
  const question = normalizeInput(input);
  if (!question) return WELCOME_REPLY;

  if (['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'].includes(question)) {
    return WELCOME_REPLY;
  }

  const ranked = KNOWLEDGE_ENTRIES
    .map((entry) => ({
      entry,
      score: entry.keywords.reduce((total, keyword) => total + keywordScore(question, keyword), 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return FALLBACK_REPLY;

  const primary = ranked[0];
  const related = ranked[1];
  const combineRelated = related && related.score >= 3 && related.score >= primary.score - 1;
  const selected = combineRelated ? [primary.entry, related.entry] : [primary.entry];

  return {
    title: primary.entry.title,
    paragraphs: selected.flatMap((entry) => entry.paragraphs),
    bullets: primary.entry.bullets,
    actions: dedupeActions(selected.flatMap((entry) => entry.actions || [])).slice(0, 3),
    suggestedPrompts: dedupePrompts(selected.flatMap((entry) => entry.suggestedPrompts || [])).slice(0, 4),
  };
}
