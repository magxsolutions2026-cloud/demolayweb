export const DEFAULT_MAX_IMAGE_URLS = 10;
const MAX_IMAGE_URL_LENGTH = 512;

function normalizeImageUrl(value: unknown): string {
  return String(value ?? '').trim().slice(0, MAX_IMAGE_URL_LENGTH);
}

export function cleanImageUrls(value: unknown, max = DEFAULT_MAX_IMAGE_URLS): string[] {
  const source = Array.isArray(value) ? value : parseImageUrls(value, max);
  const seen = new Set<string>();

  return source
    .map((entry) => normalizeImageUrl(entry))
    .filter((entry) => {
      if (!entry || seen.has(entry)) return false;
      seen.add(entry);
      return true;
    })
    .slice(0, max);
}

export function parseImageUrls(value: unknown, max = DEFAULT_MAX_IMAGE_URLS): string[] {
  if (Array.isArray(value)) return cleanImageUrls(value, max);

  const raw = String(value ?? '').trim();
  if (!raw) return [];

  if (raw.startsWith('[')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return cleanImageUrls(parsed, max);
    } catch {
      return [];
    }
  }

  return cleanImageUrls([raw], max);
}

export function serializeImageUrls(value: unknown, max = DEFAULT_MAX_IMAGE_URLS): string {
  return JSON.stringify(cleanImageUrls(value, max));
}

