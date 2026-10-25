import { formatSqlDate, formatSqlDateTime } from '@/lib/formatDb';

export type FeedItem =
  | {
      kind: 'news';
      id: number;
      title: string;
      slug: string;
      summary?: string;
      content?: string;
      image_urls?: string[];
      published_at?: string;
      sortAt: number;
    }
  | {
      kind: 'event';
      id: number;
      title: string;
      description?: string;
      event_date: string;
      event_time: string;
      location: string;
      category?: string;
      sortAt: number;
    }
  | {
      kind: 'campaign';
      id: number;
      title: string;
      slug: string;
      summary?: string;
      description?: string;
      start_date: string;
      end_date: string;
      status: string;
      unit_price: number;
      size_options: string[];
      cover_image_url?: string | null;
      image_urls?: string[];
      created_at?: string;
      sortAt: number;
    };

function parseNewsTime(published_at?: string): number {
  if (!published_at) return 0;
  const t = new Date(published_at).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function parseEventTime(event_date: string, event_time: string): number {
  const combined = `${event_date}T${event_time || '12:00'}`;
  const t = new Date(combined).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function parseCampaignTime(created_at?: string, start_date?: string): number {
  const combined = created_at || (start_date ? `${start_date}T12:00:00` : '');
  const t = new Date(combined).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function normalizeDate(value: unknown): string {
  return formatSqlDate(value);
}

function normalizeDateTime(value: unknown): string | undefined {
  if (value == null || value === '') return undefined;
  return formatSqlDateTime(value);
}

export function buildHomeFeed<
  N extends {
    id: number;
    title: string;
    slug: string;
    summary?: string;
    content?: string;
    image_urls?: string[];
    published_at?: unknown;
  },
  E extends {
    id: number;
    title: string;
    description?: string;
    event_date: unknown;
    event_time: unknown;
    location: string;
    category?: string;
  },
  C extends {
    id: number;
    name: string;
    slug: string;
    summary?: string;
    description?: string;
    start_date: unknown;
    end_date: unknown;
    status: string;
    unit_price: number | string;
    size_options: string[];
    cover_image_url?: string | null;
    image_urls?: string[];
    created_at?: unknown;
  },
>(news: N[], events: E[], campaigns: C[]): FeedItem[] {
  const n: FeedItem[] = news.map((item) => {
    const publishedAt = normalizeDateTime(item.published_at);
    return {
      kind: 'news' as const,
      id: item.id,
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      content: item.content,
      image_urls: item.image_urls,
      published_at: publishedAt,
      sortAt: parseNewsTime(publishedAt),
    };
  });
  const e: FeedItem[] = events.map((item) => {
    const eventDate = normalizeDate(item.event_date);
    return {
      kind: 'event' as const,
      id: item.id,
      title: item.title,
      description: item.description,
      event_date: eventDate,
      event_time: String(item.event_time ?? ''),
      location: item.location,
      category: item.category,
      sortAt: parseEventTime(eventDate, String(item.event_time ?? '')),
    };
  });
  const c: FeedItem[] = campaigns.map((item) => {
    const startDate = normalizeDate(item.start_date);
    const createdAt = normalizeDateTime(item.created_at);
    return {
      kind: 'campaign' as const,
      id: item.id,
      title: item.name,
      slug: item.slug,
      summary: item.summary,
      description: item.description,
      start_date: startDate,
      end_date: normalizeDate(item.end_date),
      status: item.status,
      unit_price: Number(item.unit_price),
      size_options: item.size_options,
      cover_image_url: item.cover_image_url,
      image_urls: item.image_urls,
      created_at: createdAt,
      sortAt: parseCampaignTime(createdAt, startDate),
    };
  });
  return [...n, ...e, ...c].sort((a, b) => b.sortAt - a.sortAt);
}
