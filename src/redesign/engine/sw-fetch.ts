import { reinitEngine } from './engine-boot.js';

/** A single in-flight re-init shared across concurrent healing callers. */
let healing: Promise<boolean> | undefined;

/** Whether a response is the SW's "not ready" signal (git-engine not booted). */
const isEngineNotReady = async (response: Response): Promise<boolean> => {
  if (response.status !== 503) return false;
  const body = await response
    .clone()
    .text()
    .catch(() => '');
  return body.includes('SW not ready');
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
/**
 * fetch with an optional abort timeout. A hung SW handler (e.g. a git stage that
 * never resolves) must not freeze the caller forever — with a timeout the fetch
 * rejects so the publish flow can surface an error instead of an infinite
 * "publishing…" spinner. Without a timeout it behaves exactly like native fetch
 * (reads during a slow first clone stay untimed).
 */
const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  timeoutMs: number | undefined,
): Promise<Response> => {
  if (timeoutMs === undefined) return fetch(input, init);
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    globalThis.clearTimeout(timer);
  }
};

export const swFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  timeoutMs?: number,
): Promise<Response> => {
  const response = await fetchWithTimeout(input, init, timeoutMs);
  if (!(await isEngineNotReady(response))) return response;
  healing ??= reinitEngine().finally(() => {
    healing = undefined;
  });
  const healed = await healing;
  return healed ? fetchWithTimeout(input, init, timeoutMs) : response;
};
