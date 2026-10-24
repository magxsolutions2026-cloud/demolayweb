/** Chapter funds display (locale-aware; currency can be swapped via env later). */
export function formatCurrency(amount: number, currency = 'PHP'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
