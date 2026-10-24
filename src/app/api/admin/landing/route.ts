import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { query } from '@/lib/db';

interface LandingRow {
  section: string;
  content: string;
}

export async function GET(request: Request) {
  await requireAdmin(request);
  const rows = await query<LandingRow>('SELECT section, content FROM landing_content');
  const landing = Array.isArray(rows)
    ? rows.reduce((acc, item) => {
        acc[item.section] = JSON.parse(item.content || '{}');
        return acc;
      }, {} as Record<string, unknown>)
    : {};

  return NextResponse.json({ landing });
}

function sanitizeLandingContent(section: string, content: unknown): unknown {
  if (section === 'hero' && content && typeof content === 'object') {
    const c = content as Record<string, unknown>;
    return {
      title: String(c.title ?? ''),
      subtitle: String(c.subtitle ?? ''),
      cta: String(c.cta ?? 'Join Us'),
      logo_url: String(c.logo_url ?? '')
        .trim()
        .slice(0, 512),
    };
  }
  return content;
}

export async function PUT(request: Request) {
  await requireAdmin(request);
  const body = await request.json();
  const { section, content } = body;

  if (!section || !content) {
    return NextResponse.json({ error: 'section and content required' }, { status: 400 });
  }

  const payload = sanitizeLandingContent(section, content);

  const existing = await query('SELECT id FROM landing_content WHERE section = ?', [section]);

  if (Array.isArray(existing) && existing.length > 0) {
    await query('UPDATE landing_content SET content = ? WHERE section = ?', [JSON.stringify(payload), section]);
  } else {
    await query('INSERT INTO landing_content (section, content) VALUES (?, ?)', [section, JSON.stringify(payload)]);
  }

  return NextResponse.json({ success: true });
}
