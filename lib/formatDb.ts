/** mysql2 returns JS Date for DATE / DATETIME — never render raw Date in JSX. API JSON uses ISO strings. */

const SQL_DATE_PREFIX_RE = /^(\d{4}-\d{2}-\d{2})(?:[T\s].*)?$/;

function ymdFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatSqlDate(value: unknown): string {
  if (value == null || value === '') return '';
  if (value instanceof Date) return ymdFromDate(value);
  if (typeof value === 'string') {
    const datePrefix = value.match(SQL_DATE_PREFIX_RE)?.[1];
    if (datePrefix) return datePrefix;
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return ymdFromDate(d);
    return value;
  }
  return String(value);
}

export function formatSqlDateTime(value: unknown): string {
  if (value == null || value === '') return '';
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
