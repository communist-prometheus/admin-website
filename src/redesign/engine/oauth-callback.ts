import { completeCallback } from '@/composables/useAuth/complete-callback';
import { TRUSTED_ORIGINS } from '@/composables/useOAuthPopup/trusted-origins';

/**
 * OAuth popup-callback handler for the redesigned app (auth spec). When the
 * redesign is the root app, GitHub redirects the login popup to
 * `/auth/github/callback` — this must complete the PKCE exchange and post the
 * token back to the opener, exactly as the previous Vue callback view did.
 * Reuses the framework-agnostic `completeCallback` + trusted-origin allowlist.
 */

/** The registered OAuth callback path (matches config/auth.ts). */
const CALLBACK_PATH = '/auth/github/callback';

/** Posts the token to the opener across trusted origins, then closes the popup. */
const notifyOpener = (token: string): void => {
  const message = { type: 'github-oauth-success', token };
  const targets = new Set([...TRUSTED_ORIGINS, globalThis.location.origin]);
  for (const target of targets) globalThis.opener?.postMessage(message, target);
  globalThis.close();
};

/**
 * If the current page is the OAuth callback, completes it and returns true (the
 * caller must NOT mount the app — this window is the popup). Otherwise false.
 */
export const handleOAuthCallbackIfPresent = async (): Promise<boolean> => {
  if (globalThis.location.pathname !== CALLBACK_PATH) return false;
  const params = new URLSearchParams(globalThis.location.search);
  const code = params.get('code') ?? undefined;
  const state = params.get('state') ?? undefined;
  try {
    const token = await completeCallback(code, state);
    globalThis.opener ? notifyOpener(token) : globalThis.location.replace('/');
  } catch {
    globalThis.document.body.textContent = 'Ошибка авторизации. Закройте окно и попробуйте снова.';
  }
  return true;
};
