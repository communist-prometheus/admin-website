import { SW_PROGRESS_CHANNEL } from '../../sw/protocol/channels.js';

/**
 * Live clone/pull progress relayed from the Service Worker git-engine over
 * {@link SW_PROGRESS_CHANNEL}. The SW emits isomorphic-git phase events while it
 * downloads the repo; this module keeps the latest one and lets screens render a
 * real progress bar that names what is being fetched — instead of an opaque
 * "loading…" (the repeatedly-requested clone progress UI). Phase strings stay raw
 * here (English, as isomorphic-git emits them); the UI layer localises them.
 */
export interface EngineProgress {
  readonly phase: string;
  readonly loaded: number;
  readonly total: number;
}

const target = new EventTarget();
let latest: EngineProgress | undefined;
let channel: BroadcastChannel | undefined;

const isProgress = (x: unknown): x is EngineProgress =>
  typeof x === 'object' && typeof Reflect.get(Object(x), 'phase') === 'string';

const ensureChannel = (): void => {
  if (channel !== undefined || typeof BroadcastChannel === 'undefined') return;
  channel = new BroadcastChannel(SW_PROGRESS_CHANNEL);
  channel.onmessage = (event: MessageEvent): void => {
    if (!isProgress(event.data)) return;
    latest = {
      phase: event.data.phase,
      loaded: Number(event.data.loaded) || 0,
      total: Number(event.data.total) || 0,
    };
    target.dispatchEvent(new Event('progress'));
  };
};

/** The most recent progress event, or undefined before any arrives. */
export const currentProgress = (): EngineProgress | undefined => {
  ensureChannel();
  return latest;
};

/** Subscribes to progress ticks; returns an unsubscribe function. */
export const onEngineProgress = (listener: () => void): (() => void) => {
  ensureChannel();
  target.addEventListener('progress', listener);
  return () => target.removeEventListener('progress', listener);
};
