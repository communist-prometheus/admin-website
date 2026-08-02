import {
  INITIAL_PUSH_STATE,
  SW_PUSH_STATE_CHANNEL,
  type PushState,
} from '../../sw/protocol/push-state.js';
import { SW_CONNECTIVITY_CHANNEL, type ConnectivityEvent } from '../../sw/protocol/connectivity.js';
import {
  SW_PUSH_ERROR_CHANNEL,
  type PushErrorEvent,
  type PushFailureReason,
} from '../../sw/protocol/push-error.js';
import { SW_PUSH_SUMMARY_CHANNEL, type PushSummaryEvent } from '../../sw/protocol/push-summary.js';

/**
 * Reactive client store for the SW git engine (git-engine R3). It subscribes to
 * the engine's BroadcastChannel contract and exposes a single reactive git state
 * that the Lit app-shell and screens bind to — replacing the old Vue composables
 * without reaching into SW internals. Pure + IO-injected so it unit-tests against
 * fake channels.
 */

/** The reactive git state observed by the UI. */
export interface GitState {
  readonly status: PushState['status'];
  readonly pending: number;
  readonly online: boolean;
  readonly lastError?: PushErrorEvent;
  readonly lastSyncedAt?: number;
}

/** A generic sync-status descriptor for the app-shell affordance (design-system tones). */
export interface SyncStatus {
  readonly tone: 'success' | 'info' | 'warning' | 'danger';
  readonly label: string;
}

/** Injected channel IO: subscribe to a named channel, returns an unsubscribe. */
export interface ChannelIo {
  readonly listen: (channel: string, onMessage: (data: unknown) => void) => () => void;
}

/** The store surface consumed by the UI. */
export interface GitStateStore {
  readonly get: () => GitState;
  readonly subscribe: (onChange: (state: GitState) => void) => () => void;
  readonly syncStatus: () => SyncStatus;
  readonly dispose: () => void;
}

const INITIAL: GitState = {
  status: INITIAL_PUSH_STATE.status,
  pending: INITIAL_PUSH_STATE.pending,
  online: true,
};

const errorLabels: Record<PushFailureReason, string> = {
  auth: 'нужен вход',
  'non-fast-forward': 'нужно объединить',
  network: 'нет сети',
  validation: 'ошибка проверки',
  unknown: 'ошибка публикации',
};

/** Derives the app-shell sync-status descriptor from the current git state. */
export const toSyncStatus = (state: GitState): SyncStatus => {
  const rules: ReadonlyArray<readonly [boolean, SyncStatus]> = [
    [!state.online, { tone: 'warning', label: 'офлайн — изменения в очереди' }],
    [
      state.status === 'error' && state.lastError !== undefined,
      { tone: 'danger', label: state.lastError ? errorLabels[state.lastError.reason] : 'ошибка' },
    ],
    [
      state.status === 'syncing' || state.pending > 0,
      { tone: 'info', label: `синхронизация… (${state.pending})` },
    ],
  ];
  const match = rules.find(([when]) => when);
  return match ? match[1] : { tone: 'success', label: 'синхронизировано' };
};

const isObject = (x: unknown): x is Record<string, unknown> =>
  typeof x === 'object' && x !== undefined && x !== null;

const isPushState = (x: unknown): x is PushState =>
  isObject(x) && 'status' in x && 'pending' in x;
const isConnectivity = (x: unknown): x is ConnectivityEvent => isObject(x) && 'online' in x;
const isPushError = (x: unknown): x is PushErrorEvent =>
  isObject(x) && 'reason' in x && 'sha' in x;
const isPushSummary = (x: unknown): x is PushSummaryEvent => isObject(x) && 'synced' in x;

/** The default browser IO: a real BroadcastChannel per channel name. */
export const broadcastIo: ChannelIo = {
  listen: (channel, onMessage) => {
    const bc = new BroadcastChannel(channel);
    bc.onmessage = (event: MessageEvent<unknown>): void => onMessage(event.data);
    return () => bc.close();
  },
};

/**
 * Creates the reactive git-state store, subscribing to every engine channel.
 * Each channel event maps to an immutable state update and notifies subscribers.
 */
export const createGitStateStore = (io: ChannelIo = broadcastIo): GitStateStore => {
  let state: GitState = INITIAL;
  const subscribers = new Set<(state: GitState) => void>();

  const set = (next: GitState): void => {
    state = next;
    subscribers.forEach((notify) => notify(state));
  };

  const unsubscribers: ReadonlyArray<() => void> = [
    io.listen(SW_PUSH_STATE_CHANNEL, (data) => {
      isPushState(data) && set({ ...state, status: data.status, pending: data.pending });
    }),
    io.listen(SW_CONNECTIVITY_CHANNEL, (data) => {
      isConnectivity(data) && set({ ...state, online: data.online });
    }),
    io.listen(SW_PUSH_ERROR_CHANNEL, (data) => {
      isPushError(data) && set({ ...state, status: 'error', lastError: data });
    }),
    io.listen(SW_PUSH_SUMMARY_CHANNEL, (data) => {
      isPushSummary(data) && data.synced > 0 && set({ ...state, lastSyncedAt: Date.now() });
    }),
  ];

  return {
    get: () => state,
    subscribe: (onChange) => {
      subscribers.add(onChange);
      return () => subscribers.delete(onChange);
    },
    syncStatus: () => toSyncStatus(state),
    dispose: () => unsubscribers.forEach((off) => off()),
  };
};
