const MAX_TITLE = 255;
const MAX_TEXT = 8000;
const MAX_EMAIL = 255;
const MAX_PHONE = 64;

export function sanitizeTitle(v: unknown): string {
  const s = String(v ?? '').trim();
  return s.slice(0, MAX_TITLE);
}

export function sanitizeText(v: unknown): string {
  const s = String(v ?? '').trim();
  return s.slice(0, MAX_TEXT);
}

/** Parses amount; returns null if invalid or negative. */
export function parseAmount(v: unknown): number | null {
  const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/,/g, ''));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export const SOURCE_TYPES = ['donations', 'events', 'contributions', 'sponsors', 'other'] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export function parseSourceType(v: unknown): SourceType | null {
  const s = String(v ?? '').toLowerCase();
  return SOURCE_TYPES.includes(s as SourceType) ? (s as SourceType) : null;
}

export const CAMPAIGN_STATUSES = ['draft', 'active', 'completed'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export function parseCampaignStatus(v: unknown): CampaignStatus | null {
  const s = String(v ?? '').toLowerCase();
  return CAMPAIGN_STATUSES.includes(s as CampaignStatus) ? (s as CampaignStatus) : null;
}

export const CAMPAIGN_TYPES = ['general', 'tshirt'] as const;
export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export function parseCampaignType(v: unknown): CampaignType | null {
  const s = String(v ?? '').toLowerCase();
  return CAMPAIGN_TYPES.includes(s as CampaignType) ? (s as CampaignType) : null;
}

export function parseDateOnly(v: unknown): string | null {
  const s = String(v ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? null : s;
}

/** Optional label when source_type is `other` (max 255 chars). */
export function sanitizeSourceSpecify(v: unknown): string | null {
  const s = String(v ?? '').trim().slice(0, 255);
  return s || null;
}

export function sanitizeSlug(v: unknown): string {
  const s = String(v ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return s.slice(0, MAX_TITLE);
}

export const DEFAULT_TSHIRT_SIZES = ['S', 'M', 'L', 'XL'] as const;

export function parseCampaignSizeOptions(
  value: unknown,
  fallback: readonly string[] = DEFAULT_TSHIRT_SIZES,
): string[] {
  let raw: unknown[] = [];

  if (Array.isArray(value)) {
    raw = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      raw = [];
    } else if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        raw = Array.isArray(parsed) ? parsed : [];
      } catch {
        raw = trimmed.split(',');
      }
    } else {
      raw = trimmed.split(',');
    }
  }

  const sizes = raw
    .map((entry) =>
      String(entry ?? '')
        .toUpperCase()
        .trim()
        .replace(/[^A-Z0-9+ -]/g, '')
        .replace(/\s+/g, ''),
    )
    .filter(Boolean)
    .map((entry) => entry.slice(0, 12));

  const unique = [...new Set(sizes)];
  return unique.length > 0 ? unique : [...fallback];
}

export function serializeCampaignSizeOptions(value: unknown): string {
  return JSON.stringify(parseCampaignSizeOptions(value));
}

export function parsePositiveInt(value: unknown, max = 999): number | null {
  const n = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(n) || n < 1 || n > max) return null;
  return n;
}

export function sanitizeEmail(value: unknown): string {
  return String(value ?? '').trim().toLowerCase().slice(0, MAX_EMAIL);
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function sanitizePhone(value: unknown): string {
  return String(value ?? '').trim().slice(0, MAX_PHONE);
}
