import { NextResponse } from 'next/server';

/** Must match login cookie options or the browser may keep `admin_session`. */
const clearedSessionCookie = {
  path: '/' as const,
  maxAge: 0,
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
};

export async function POST(request: Request) {
  const to = new URL('/', request.url);
  const response = NextResponse.redirect(to, 303);
  response.cookies.set('admin_session', '', clearedSessionCookie);
  return response;
}

/** Allow GET /api/admin/logout (bookmarks) — same clear + redirect. */
export async function GET(request: Request) {
  const to = new URL('/', request.url);
  const response = NextResponse.redirect(to, 303);
  response.cookies.set('admin_session', '', clearedSessionCookie);
  return response;
}
