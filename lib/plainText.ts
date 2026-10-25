const BLOCK_BREAK_RE = /<\s*\/\s*(p|div|section|article|blockquote|h[1-6]|ul|ol)\s*>/gi;
const LINE_BREAK_RE = /<\s*br\s*\/?\s*>/gi;
const LIST_ITEM_OPEN_RE = /<\s*li[^>]*>/gi;
const TAG_RE = /<[^>]+>/g;
const NUMERIC_ENTITY_RE = /&#(\d+);/g;
const HEX_ENTITY_RE = /&#x([0-9a-f]+);/gi;

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
};

function safeFromCodePoint(code: number): string {
  if (!Number.isFinite(code) || code < 0 || code > 0x10ffff) return '';
  try {
    return String.fromCodePoint(code);
  } catch {
    return '';
  }
}

function decodeEntities(value: string): string {
  return value
    .replace(HEX_ENTITY_RE, (_, hex: string) => {
      const code = Number.parseInt(hex, 16);
      return safeFromCodePoint(code);
    })
    .replace(NUMERIC_ENTITY_RE, (_, num: string) => {
      const code = Number.parseInt(num, 10);
      return safeFromCodePoint(code);
    })
    .replace(/&([a-z]+);/gi, (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match);
}

export function htmlToPlainText(value: unknown, fallback = ''): string {
  if (value == null || value === '') return fallback;

  const raw = String(value).replace(/\r\n?/g, '\n');
  const withBreaks = raw
    .replace(LINE_BREAK_RE, '\n')
    .replace(BLOCK_BREAK_RE, '\n\n')
    .replace(LIST_ITEM_OPEN_RE, '- ');

  const withoutTags = decodeEntities(withBreaks)
    .replace(TAG_RE, '')
    .split('\n')
    .map((line) => line.replace(/[ \t]+/g, ' ').trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return withoutTags || fallback;
}
