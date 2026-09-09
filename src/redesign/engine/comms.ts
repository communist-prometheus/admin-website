import { commsFetch } from '@/stores/comms-http';

/**
 * Newsletter (comms-worker) client for the redesign (comms R5). The worker is a
 * real, deployed service — subscribers, the send log and the manual dispatch all
 * exist behind `VITE_COMMS_BASE` (dev: dev-lists.comprom.org). This reuses the
 * app's {@link commsFetch}, which sends the SSO cookie and re-mints the session
 * on a 401, so the redesign screen shows and drives the ACTUAL list instead of a
 * mock. Reads resolve to a discriminated result so the screen can tell "empty"
 * from "the request failed" (and never claim the feature is absent — it isn't).
 */

/** One mailing-list subscriber as the worker serialises it. */
export interface Subscriber {
  readonly id: number;
  readonly email: string;
  readonly langs: readonly string[];
  readonly status: 'active' | 'unsubscribed' | 'bounced' | 'complained';
  readonly createdAt: string;
  readonly lastSentAt?: string;
}

/** One past dispatch row from the send log. */
export interface SendRun {
  readonly id: number;
  readonly tickAt: string;
  readonly articleCount: number;
  readonly status: string;
  readonly error?: string;
}

/** Result of the manual "send now" dispatch. */
export interface DispatchResult {
  readonly ok: boolean;
  readonly sent?: number;
  readonly failed?: number;
  readonly error?: string;
}

/** A read that distinguishes a successful (possibly empty) load from a failure. */
export type CommsRead<T> = { readonly ok: true; readonly data: T } | { readonly ok: false };

const readList = async <T>(path: string, key: string): Promise<CommsRead<readonly T[]>> => {
  try {
    const response = await commsFetch(path);
    if (!response.ok) return { ok: false };
    const body: unknown = await response.json();
    const list = typeof body === 'object' && body !== null && key in body ? Reflect.get(body, key) : undefined;
    return { ok: true, data: Array.isArray(list) ? (list as readonly T[]) : [] };
  } catch {
    return { ok: false };
  }
};

/** Reads the real subscriber list from the comms worker. */
export const listSubscribers = (): Promise<CommsRead<readonly Subscriber[]>> =>
  readList<Subscriber>('/api/subscribers', 'subscribers');

/** Reads the real send log (past dispatches) from the comms worker. */
export const listRuns = (): Promise<CommsRead<readonly SendRun[]>> =>
  readList<SendRun>('/api/runs', 'runs');

/** Outcome of adding a subscriber, distinguishing the known failure modes. */
export type AddResult =
  | { readonly ok: true; readonly subscriber: Subscriber }
  | { readonly ok: false; readonly reason: 'duplicate' | 'invalid' | 'error' };

/** Adds a subscriber (`POST /api/subscribers`). Langs are the digest languages. */
export const addSubscriber = async (
  email: string,
  langs: readonly string[],
): Promise<AddResult> => {
  try {
    const response = await commsFetch('/api/subscribers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), langs }),
    });
    if (response.status === 201) {
      const subscriber: unknown = await response.json().catch(() => undefined);
      return isSubscriber(subscriber)
        ? { ok: true, subscriber }
        : { ok: false, reason: 'error' };
    }
    if (response.status === 409) return { ok: false, reason: 'duplicate' };
    if (response.status === 422) return { ok: false, reason: 'invalid' };
    return { ok: false, reason: 'error' };
  } catch {
    return { ok: false, reason: 'error' };
  }
};

/** Removes a subscriber (`DELETE /api/subscribers/:id`). Returns success. */
export const removeSubscriber = async (id: number): Promise<boolean> => {
  try {
    const response = await commsFetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    return response.ok;
  } catch {
    return false;
  }
};

/** Narrows an unknown value to a {@link Subscriber}. */
const isSubscriber = (x: unknown): x is Subscriber =>
  typeof x === 'object' && x !== null && 'id' in x && 'email' in x;

/**
 * Triggers the owner-only manual dispatch (`POST /api/dispatch?force=1`). This
 * really sends to every active subscriber, so the screen must confirm first.
 */
export const forceDispatch = async (): Promise<DispatchResult> => {
  try {
    const response = await commsFetch('/api/dispatch?force=1', { method: 'POST' });
    const body: unknown = await response.json().catch(() => ({}));
    const num = (k: string): number | undefined =>
      typeof body === 'object' && body !== null && typeof Reflect.get(body, k) === 'number'
        ? Number(Reflect.get(body, k))
        : undefined;
    if (response.status === 202 || response.ok) {
      return { ok: true, sent: num('sent'), failed: num('failed') };
    }
    return { ok: false, error: `dispatch failed: ${response.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** The dispatch schedule as the worker stores and returns it. */
export interface DispatchSchedule {
  readonly cron: string;
  readonly timezone: string;
  /** Next moment the worker will fire, computed server-side (ISO, UTC). */
  readonly nextRunAt: string;
}

/** One past dispatch, folded back together from its per-recipient rows. */
export interface DispatchTick {
  readonly tickAt: string;
  readonly recipients: number;
  readonly sent: number;
  readonly failed: number;
  readonly bounced: number;
  readonly complained: number;
  readonly skipped: number;
  readonly articleCount: number;
}

/** One recipient of one dispatch, with the outcome recorded for them. */
export interface DispatchRecipient {
  readonly id: number;
  readonly subscriberId?: number;
  readonly email?: string;
  readonly tickAt: string;
  readonly articleCount: number;
  readonly status: string;
  readonly error?: string;
}

const readJson = async (path: string): Promise<unknown | undefined> => {
  try {
    const response = await commsFetch(path);
    if (!response.ok) return undefined;
    return await response.json();
  } catch {
    return undefined;
  }
};

const field = (body: unknown, key: string): unknown =>
  typeof body === 'object' && body !== null && key in body ? Reflect.get(body, key) : undefined;

/** Reads the saved dispatch schedule (`GET /api/schedule`). */
export const readSchedule = async (): Promise<CommsRead<DispatchSchedule>> => {
  const body = await readJson('/api/schedule');
  const cron = field(body, 'cron');
  const timezone = field(body, 'timezone');
  if (typeof cron !== 'string' || typeof timezone !== 'string') return { ok: false };
  const next = field(body, 'nextRunAt');
  return { ok: true, data: { cron, timezone, nextRunAt: typeof next === 'string' ? next : '' } };
};

/** Outcome of saving the schedule, carrying the worker's reason on refusal. */
export type SaveScheduleResult =
  | { readonly ok: true; readonly schedule: DispatchSchedule }
  | { readonly ok: false; readonly error: string };

/** Saves the dispatch schedule (`PUT /api/schedule`). */
export const saveSchedule = async (s: {
  readonly cron: string;
  readonly timezone: string;
}): Promise<SaveScheduleResult> => {
  try {
    const response = await commsFetch('/api/schedule', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cron: s.cron, timezone: s.timezone }),
    });
    const body: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const error = field(body, 'error');
      return { ok: false, error: typeof error === 'string' ? error : `HTTP ${response.status}` };
    }
    const next = field(body, 'nextRunAt');
    return {
      ok: true,
      schedule: { ...s, nextRunAt: typeof next === 'string' ? next : '' },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/**
 * Reads the global cutoff watermark (`GET /api/cutoff`) — the boundary
 * that decides which published material still counts as new. `undefined`
 * means no boundary has been recorded, so everything counts.
 */
export const readCutoff = async (): Promise<CommsRead<string | undefined>> => {
  const body = await readJson('/api/cutoff');
  if (body === undefined) return { ok: false };
  const at = field(body, 'at');
  return { ok: true, data: typeof at === 'string' ? at : undefined };
};

/** Reads the dispatch history, one entry per run (`GET /api/runs/ticks`). */
export const listDispatches = (): Promise<CommsRead<readonly DispatchTick[]>> =>
  readList<DispatchTick>('/api/runs/ticks', 'ticks');

/** Reads the recipients of one dispatch (`GET /api/runs/tick?at=…`). */
export const listDispatchRecipients = (
  tickAt: string,
): Promise<CommsRead<readonly DispatchRecipient[]>> =>
  readList<DispatchRecipient>(`/api/runs/tick?at=${encodeURIComponent(tickAt)}`, 'runs');
