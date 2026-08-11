import { getGitHubConfig } from '../../config/github.js';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { registerEngine } from './sw-client.js';
import { markEngineReady } from './engine-ready.js';

/**
 * Boots the real content engine for the new UI (git-engine R2/R4/R7): registers
 * the Service Worker and initializes it via `POST /api/sw/init` — the SW's
 * fetch-intercepted init route that stores the config and clones/syncs the repo.
 * Only runs when a dev token is present (local `dev:token` mode); otherwise the
 * preview stays on sample data.
 */

/** Resolves once the page is controlled by a SW (so its fetch handler runs). */
const waitForController = (timeoutMs: number): Promise<boolean> =>
  new Promise((resolve) => {
    if (navigator.serviceWorker.controller !== null) return resolve(true);
    const timer = globalThis.setTimeout(() => resolve(false), timeoutMs);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      () => {
        globalThis.clearTimeout(timer);
        resolve(true);
      },
      { once: true },
    );
  });

/** Reads the classic session token persisted by the login flow, if any. */
const storedToken = (): string | undefined => {
  try {
    return localStorage.getItem('gh_token') ?? undefined;
  } catch {
    return undefined;
  }
};

/**
 * The token the engine should boot/heal with: the injected dev token locally,
 * otherwise the OAuth session token, falling back to the persisted `gh_token`.
 * The fallback matters because the session and the stored token are separate
 * stores — the session can lapse while `gh_token` is still valid, and without it
 * a re-init would find no token and the engine would stay "not ready".
 */
const engineToken = async (): Promise<string | undefined> => {
  const dev = import.meta.env.VITE_DEV_TOKEN;
  if (typeof dev === 'string' && dev.length > 0) return dev;
  return (await ensureFreshToken()) ?? storedToken();
};

export const bootEngine = async (token: string): Promise<void> => {
  await registerEngine('/sw.js');
  const controlled = await waitForController(4000);
  if (!controlled) {
    // First load may not be claimed yet; a reload will control the page and boot.
    globalThis.location.reload();
    return;
  }
  const config = getGitHubConfig();
  const response = await fetch('/api/sw/init', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...config, token }),
  });
  const result: { ok?: boolean; error?: string } = await response.json();
  if (result.ok !== true) throw new Error(`engine init failed: ${result.error ?? response.status}`);
  // Repo is cloned/synced: let screens that mounted before this re-read now.
  markEngineReady();
};

/**
 * Boots the engine with a real token: the injected dev token (local `dev:token`)
 * or, on the deployed origin, the OAuth session token shared with the current
 * admin (`ensureFreshToken`). No-op (sample data) when no session exists.
 */
export const bootEngineIfTokenPresent = async (): Promise<void> => {
  const token = await engineToken();
  await (token !== undefined ? bootEngine(token) : Promise.resolve());
};

/**
 * Re-initializes an already-controlling SW git-engine with a fresh token, used
 * to self-heal a "SW not ready" 503 (SW eviction, a new SW version after a
 * deploy, or a stale token in the SW's persisted config). The page is already
 * claimed by the time a 503 comes back, so registration/controller-wait are
 * skipped — we just re-run `/api/sw/init`. Returns whether the engine is ready.
 */
export const reinitEngine = async (): Promise<boolean> => {
  if (navigator.serviceWorker.controller === null) return false;
  const token = await engineToken();
  if (token === undefined) return false;
  const config = getGitHubConfig();
  const response = await fetch('/api/sw/init', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...config, token }),
  });
  const result: { ok?: boolean } = await response.json().catch(() => ({}));
  if (result.ok === true) {
    markEngineReady();
    return true;
  }
  return false;
};
