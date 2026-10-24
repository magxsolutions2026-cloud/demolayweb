const DISPLAY_LOCALE = 'en-US';
const DISPLAY_TIME_ZONE = 'Asia/Manila';

const newsDateFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  day: 'numeric',
  month: 'numeric',
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
});

const newsDateTimeFormatter = new Intl.DateTimeFormat(DISPLAY_LOCALE, {
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  month: 'numeric',
  timeZone: DISPLAY_TIME_ZONE,
  year: 'numeric',
});

function parseNewsDate(value: string | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatNewsDateLabel(
  value: string | undefined,
  fallback = 'Chapter Update'
): string {
  const parsed = parseNewsDate(value);
  return parsed ? newsDateFormatter.format(parsed) : fallback;
}

export function formatNewsDateTimeLabel(
  value: string | undefined,
  fallback = 'News'
): string {
  const parsed = parseNewsDate(value);
  return parsed ? newsDateTimeFormatter.format(parsed) : fallback;
}
