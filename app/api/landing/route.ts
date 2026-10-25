import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface LandingRow {
  section: string;
  content: string;
}

const DEFAULT_PRIMARY = '#800020';
const DEFAULT_SECONDARY = '#ffd700';

export async function GET() {
  try {
    const rows = await query<LandingRow>('SELECT section, content FROM landing_content');
    const landing = Array.isArray(rows)
      ? rows.reduce((acc, item) => {
          try {
            acc[item.section] = JSON.parse(item.content || '{}');
          } catch {
            acc[item.section] = {};
          }
          return acc;
        }, {} as Record<string, unknown>)
      : {};

    const themeSection = landing['theme'] as { primary_color?: string; secondary_color?: string } | undefined;
    const primaryColor = themeSection?.primary_color || DEFAULT_PRIMARY;
    const secondaryColor = themeSection?.secondary_color || DEFAULT_SECONDARY;

    return NextResponse.json({
      landing,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
    });
  } catch (err) {
    // DB unreachable, missing table, or bad credentials — still return 200 so public theme fetch works offline.
    console.error('[api/landing] GET failed:', err);
    return NextResponse.json({
      landing: {} as Record<string, unknown>,
      primary_color: DEFAULT_PRIMARY,
      secondary_color: DEFAULT_SECONDARY,
    });
  }
}

