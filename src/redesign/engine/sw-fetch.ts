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
export const swFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  const response = await fetch(input, init);
  if (!(await isEngineNotReady(response))) return response;
  healing ??= reinitEngine().finally(() => {
    healing = undefined;
  });
  const healed = await healing;
  return healed ? fetch(input, init) : response;
};
