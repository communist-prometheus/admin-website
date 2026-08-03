import type { User } from '@/types/user';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user';
import { clearToken, saveToken } from '@/composables/useAuth/token-storage';
import { buildAuthorizeUrl } from '@/composables/useOAuthPopup/authorize-url';
import { createMessageHandler } from '@/composables/useOAuthPopup/handlers';
import { createPopupMonitor } from '@/composables/useOAuthPopup/popup-monitor';
import { createPopupWindow } from '@/composables/useOAuthPopup/popup-window';

/**
 * Real authentication for the redesigned UI (auth spec), reusing the current
 * admin's proven OAuth building blocks (same GitHub App, same registered
 * callback) — no Vue. `login()` runs the popup flow and resolves with the
 * authenticated user; `currentUser()` resolves an existing session on load.
 */

/**
 * Runs the GitHub OAuth popup and resolves with the user, or undefined on
 * cancel/error. `onError` receives the CONCRETE failure surfaced by the popup
 * (GitHub error, token-exchange failure) so the UI can show the real cause
 * instead of a generic message; every step is also logged to the console.
 */
export const login = (onError?: (message: string) => void): Promise<User | undefined> =>
  new Promise((resolve) => {
    // The callback popup posts the token and then closes itself. The
    // close-monitor polls every 500ms, but the success handler must first
    // `fetchGitHubUser` (~1s) before it resolves — so the monitor used to win
    // the race and report "closed before completing" even though the token had
    // arrived and been saved. `settled` records the first real outcome; on a
    // bare close we wait a grace period for a pending message before giving up.
    let settled = false;
    const finish = (user: User | undefined): void => {
      if (settled) return;
      settled = true;
      resolve(user);
    };
    void buildAuthorizeUrl().then((url) => {
      // eslint-disable-next-line no-console
      console.info('[oauth-login] opening popup', { authorize: url.split('?')[0] });
      const popup = createPopupWindow(url);
      const cleanup = (): void => {
        globalThis.removeEventListener('message', handleMessage);
        popup?.close();
      };
      const handleMessage = createMessageHandler(
        (user) => {
          // eslint-disable-next-line no-console
          console.info('[oauth-login] success', { user: user.username });
          saveToken(user.accessToken);
          finish(user);
        },
        (message) => {
          // eslint-disable-next-line no-console
          console.error('[oauth-login] error from popup:', message);
          onError?.(message);
          finish(undefined);
        },
        cleanup,
      );
      globalThis.addEventListener('message', handleMessage);
      createPopupMonitor(popup, () => {
        // Popup closed: give an in-flight success/error message time to settle
        // (the token may already be posted) before treating it as a cancel.
        if (settled) return;
        globalThis.setTimeout(() => {
          if (settled) return;
          // eslint-disable-next-line no-console
          console.warn('[oauth-login] popup closed with no result — treating as cancel');
          globalThis.removeEventListener('message', handleMessage);
          finish(undefined);
        }, 2500);
      });
    });
  });

/**
 * Bypass login: persist a pasted GitHub token (PAT) and resolve its user. This
 * is the stable, OAuth-free path for dev — the token lands under the same
 * `gh_token` key the engine reads, so it survives reloads and never falls back
 * to demo data. Returns undefined if the token is rejected.
 */
export const loginWithToken = async (token: string): Promise<User | undefined> => {
  const trimmed = token.trim();
  if (trimmed.length === 0) return undefined;
  try {
    const user = await fetchGitHubUser(trimmed);
    saveToken(trimmed);
    return user;
  } catch {
    return undefined;
  }
};

/** Resolves the current session's user (fresh token), or undefined if signed out. */
export const currentUser = async (): Promise<User | undefined> => {
  const token = await ensureFreshToken();
  if (token === null || token === undefined) return undefined;
  try {
    return await fetchGitHubUser(token);
  } catch {
    return undefined;
  }
};

/** Signs out: clears the stored token so the next load is a clean slate. */
export const logout = (): void => clearToken();
