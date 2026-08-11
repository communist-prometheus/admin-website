import type { User } from '@/types/user';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user';
import { saveToken } from '@/composables/useAuth/token-storage';
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

/** Runs the GitHub OAuth popup and resolves with the user, or undefined on cancel/error. */
export const login = (): Promise<User | undefined> =>
  new Promise((resolve) => {
    void buildAuthorizeUrl().then((url) => {
      const popup = createPopupWindow(url);
      const cleanup = (): void => {
        globalThis.removeEventListener('message', handleMessage);
        popup?.close();
      };
      const handleMessage = createMessageHandler(
        (user) => {
          saveToken(user.accessToken);
          resolve(user);
        },
        () => resolve(undefined),
        cleanup,
      );
      globalThis.addEventListener('message', handleMessage);
      createPopupMonitor(popup, () => {
        globalThis.removeEventListener('message', handleMessage);
        resolve(undefined);
      });
    });
  });

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
