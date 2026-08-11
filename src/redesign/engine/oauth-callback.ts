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

/** Posts the CONCRETE failure back to the opener so it can show the real cause. */
const notifyOpenerError = (error: string): void => {
  const message = { type: 'github-oauth-error', error };
  const targets = new Set([...TRUSTED_ORIGINS, globalThis.location.origin]);
  for (const target of targets) globalThis.opener?.postMessage(message, target);
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
  const oauthError = params.get('error') ?? undefined;
  const oauthErrorDesc = params.get('error_description') ?? undefined;
  // eslint-disable-next-line no-console
  console.info('[oauth-callback]', {
    origin: globalThis.location.origin,
    hasCode: code !== undefined,
    hasState: state !== undefined,
    hasOpener: globalThis.opener !== null,
    githubError: oauthError,
    githubErrorDesc: oauthErrorDesc,
  });
  // GitHub can bounce back with ?error=... (e.g. redirect_uri mismatch, access_denied).
  if (oauthError !== undefined) {
    const message = `GitHub: ${oauthError}${oauthErrorDesc ? ` — ${oauthErrorDesc}` : ''}`;
    // eslint-disable-next-line no-console
    console.error('[oauth-callback] GitHub returned an error', message);
    notifyOpenerError(message);
    globalThis.document.body.textContent = message;
    return true;
  }
  try {
    const token = await completeCallback(code, state);
    // eslint-disable-next-line no-console
    console.info('[oauth-callback] token exchange OK');
    globalThis.opener ? notifyOpener(token) : globalThis.location.replace('/');
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    // eslint-disable-next-line no-console
    console.error('[oauth-callback] token exchange FAILED:', message, e);
    notifyOpenerError(message);
    globalThis.document.body.textContent = `Ошибка авторизации: ${message}. Закройте окно и попробуйте снова.`;
  }
  return true;
};
