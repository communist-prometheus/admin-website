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
  const dev = import.meta.env.VITE_DEV_TOKEN;
  const token =
    typeof dev === 'string' && dev.length > 0 ? dev : ((await ensureFreshToken()) ?? undefined);
  await (token !== undefined ? bootEngine(token) : Promise.resolve());
};
