export function cleanText(value: unknown, max = 255) {
  const text = String(value ?? '').trim();
  return text.slice(0, max);
}

export function cleanEmail(value: unknown, max = 255) {
  return cleanText(value, max).toLowerCase();
}

export function cleanLongText(value: unknown, max = 5000) {
  const text = String(value ?? '').trim();
  return text.slice(0, max);
}

export function cleanNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function cleanBoolean(value: unknown) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return false;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validatePasswordRule(value: string) {
  if (value.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(value)) return 'Password must include at least one uppercase letter.';
  if (!/[a-z]/.test(value)) return 'Password must include at least one lowercase letter.';
  if (!/\d/.test(value)) return 'Password must include at least one number.';
  return '';
}

/** Events calendar: important (gold), formal (red), activity (orange) */
export function cleanEventCategory(value: unknown): 'important' | 'formal' | 'activity' {
  const v = cleanText(value, 32).toLowerCase();
  if (v === 'important' || v === 'formal' || v === 'activity') return v;
  return 'activity';
}
