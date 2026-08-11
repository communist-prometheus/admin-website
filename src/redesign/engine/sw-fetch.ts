import { reinitEngine } from './engine-boot.js';

/** A single in-flight re-init shared across concurrent healing callers. */
let healing: Promise<boolean> | undefined;

/**
 * The per-session capability nonce the SW issued at init. Attached to every
 * request as `X-SW-Nonce` so the SW's confused-deputy guard accepts it. Held in
 * module memory (never in localStorage/IndexedDB) so a casually injected script
 * cannot read it; set by the boot/reinit flow from the init response.
 */
let nonce: string | undefined;

/** Records the nonce returned by `/api/sw/init` (or clears it on logout). */
export const setSwNonce = (value: string | undefined): void => {
  nonce = value;
};

/** Adds the `X-SW-Nonce` header to a request's init without mutating the input. */
const withNonce = (init?: RequestInit): RequestInit | undefined => {
  if (nonce === undefined) return init;
  const headers = new Headers(init?.headers);
  headers.set('X-SW-Nonce', nonce);
  return { ...init, headers };
};

/** Whether a response is a signal the swFetch should re-init and retry once. */
const shouldHeal = async (response: Response): Promise<boolean> => {
  if (response.status !== 503 && response.status !== 403) return false;
  const body = await response
    .clone()
    .text()
    .catch(() => '');
  return body.includes('SW not ready') || body.includes('SW nonce');
};

/**
 * fetch for the SW git-engine that self-heals a "SW not ready" 503 (git-engine
 * R2/R4). The engine can be un-booted after an SW eviction, a new SW version
 * following a deploy, or a stale token in its persisted config — in which case
 * every content read comes back 503 and the screens look empty even though the
 * repo is intact. On that signal this re-initializes the engine with a fresh
 * token exactly once (deduped across concurrent callers) and retries the
 * request; any other outcome passes through untouched.
 */
export const swFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, withNonce(init));
  if (!(await shouldHeal(response))) return response;
  healing ??= reinitEngine().finally(() => {
    healing = undefined;
  });
  const healed = await healing;
  return healed ? fetch(input, withNonce(init)) : response;
};
