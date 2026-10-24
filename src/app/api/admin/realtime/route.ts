import { requireAdmin } from '@/lib/auth';
import { subscribeAdminRealtime, type AdminRealtimeEvent } from '@/lib/adminRealtime';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const encoder = new TextEncoder();

function encodeSse(payload: string) {
  return encoder.encode(payload);
}

function writeSseEvent(event: string, data: Record<string, unknown>, id?: number) {
  const lines = [
    id ? `id: ${id}` : '',
    `event: ${event}`,
    `data: ${JSON.stringify(data)}`,
    '',
  ].filter(Boolean);

  return encodeSse(`${lines.join('\n')}\n`);
}

function writeComment(comment: string) {
  return encodeSse(`: ${comment}\n\n`);
}

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
    let unsubscribe: (() => void) | undefined;
    let closed = false;

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const safeEnqueue = (chunk: Uint8Array) => {
          if (closed) return;
          try {
            controller.enqueue(chunk);
          } catch {
            close();
          }
        };

        const close = () => {
          if (closed) return;
          closed = true;
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          if (unsubscribe) unsubscribe();
          try {
            controller.close();
          } catch {}
        };

        safeEnqueue(writeComment('connected'));
        safeEnqueue(
          writeSseEvent('ready', {
            channels: ['petitioners', 'subscribers', 'orders'],
            at: new Date().toISOString(),
          }),
        );

        unsubscribe = subscribeAdminRealtime((event: AdminRealtimeEvent) => {
          safeEnqueue(writeSseEvent(event.channel, event, event.id));
        });

        heartbeatTimer = setInterval(() => {
          safeEnqueue(writeComment('heartbeat'));
        }, 25000);

        request.signal.addEventListener('abort', close, { once: true });
      },
      cancel() {
        closed = true;
        if (heartbeatTimer) clearInterval(heartbeatTimer);
        if (unsubscribe) unsubscribe();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Failed to open admin realtime stream', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
