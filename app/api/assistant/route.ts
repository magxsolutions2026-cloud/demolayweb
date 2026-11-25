import { NextResponse } from 'next/server';
import { cleanLongText } from '@/lib/validation';
import { streamAssistantReply, type AssistantTurn } from '@/lib/siteAssistantAi';

const MAX_TURNS = 8;
const MAX_CHARS = 600;

/** Per-visitor limits so the public chat cannot exhaust the free Groq quota. */
const PER_MINUTE = 8;
const PER_DAY = 60;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 24 * 60 * 60 * 1000);
  const lastMinute = recent.filter((t) => now - t < 60 * 1000).length;
  if (lastMinute >= PER_MINUTE || recent.length >= PER_DAY) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/** 503 tells the chat widget to use its built-in answers instead. */
const fallback = (reason: string) => NextResponse.json({ fallback: true, reason }, { status: 503 });

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
  if (rateLimited(ip)) return fallback('rate_limited');

  const body = await request.json().catch(() => null);
  const raw: unknown[] = Array.isArray(body?.messages) ? body.messages : [];
  const history: AssistantTurn[] = raw
    .slice(-MAX_TURNS)
    .map((m) => {
      const turn = m as { role?: unknown; content?: unknown };
      return {
        role: turn.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: cleanLongText(turn.content, MAX_CHARS),
      };
    })
    .filter((m) => m.content);

  if (!history.length || history[history.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });
  }

  const stream = await streamAssistantReply(history);
  if (!stream) return fallback('unavailable');

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}
