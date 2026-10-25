import 'server-only';

export type AdminRealtimeChannel = 'petitioners' | 'subscribers' | 'orders';

export type AdminRealtimeEvent = {
  id: number;
  channel: AdminRealtimeChannel;
  at: string;
};

type Listener = (event: AdminRealtimeEvent) => void;

type AdminRealtimeState = {
  listeners: Map<number, Listener>;
  nextEventId: number;
  nextListenerId: number;
};

const ADMIN_REALTIME_STATE_KEY = '__demolay_admin_realtime_state__';

function getAdminRealtimeState() {
  const globalState = globalThis as typeof globalThis & {
    [ADMIN_REALTIME_STATE_KEY]?: AdminRealtimeState;
  };

  if (!globalState[ADMIN_REALTIME_STATE_KEY]) {
    globalState[ADMIN_REALTIME_STATE_KEY] = {
      listeners: new Map(),
      nextEventId: 1,
      nextListenerId: 1,
    };
  }

  return globalState[ADMIN_REALTIME_STATE_KEY];
}

export function publishAdminRealtime(channel: AdminRealtimeChannel) {
  const state = getAdminRealtimeState();
  const event: AdminRealtimeEvent = {
    id: state.nextEventId,
    channel,
    at: new Date().toISOString(),
  };
  state.nextEventId += 1;

  state.listeners.forEach((listener) => {
    try {
      listener(event);
    } catch (error) {
      console.error('Admin realtime listener failed', error);
    }
  });

  return event;
}

export function subscribeAdminRealtime(listener: Listener) {
  const state = getAdminRealtimeState();
  const listenerId = state.nextListenerId;
  state.nextListenerId += 1;

  state.listeners.set(listenerId, listener);

  return () => {
    state.listeners.delete(listenerId);
  };
}
