/**
 * Origins allowed to exchange OAuth success messages with the admin.
 *
 * Used on BOTH sides of the popup handshake:
 * - the opener drops any message whose `event.origin` is not listed
 *   (see handlers.ts);
 * - the callback popup posts the token only TO these origins —
 *   never `'*'`, so a malicious opener that spawned the callback
 *   URL itself can not receive the credential.
 */
export const TRUSTED_ORIGINS: readonly string[] = [
  'https://admin.comprom.org',
  'https://dev-admin.comprom.org',
  'https://admin-website.igor-ganov.workers.dev',
  'http://localhost:5173',
  'http://localhost:4173',
]

/**
 * Check whether an origin participates in the OAuth handshake.
 * The current origin is always trusted (same-origin popup case).
 * @param origin - Origin to check (e.g. event.origin)
 * @returns true when the origin is the app itself or allowlisted
 */
export const isTrustedOrigin = (origin: string): boolean =>
  typeof globalThis.location !== 'undefined' &&
  (origin === globalThis.location.origin || TRUSTED_ORIGINS.includes(origin))
