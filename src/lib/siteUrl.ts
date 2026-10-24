import { cleanText } from '@/lib/validation';

export function resolveSiteUrl(request?: Request) {
  const envUrl = cleanText(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL, 255);
  if (envUrl) return envUrl.replace(/\/+$/, '');

  if (request) {
    const origin = request.headers.get('origin');
    if (origin) return origin.replace(/\/+$/, '');

    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    if (host) return `${proto}://${host}`.replace(/\/+$/, '');
  }

  return 'http://localhost:3000';
}
