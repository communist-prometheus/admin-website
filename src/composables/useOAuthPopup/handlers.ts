import type { User } from '@/types/user'
import { decodeOrUndefined } from '@/validation/decode'
import { OAuthMessageSchema } from '@/validation/schemas/oauth-message'
import { handleCode } from './handle-code'
import { handleToken } from './handle-token'

/**
 * Origins allowed to deliver OAuth messages to the admin opener.
 *
 * When the popup's redirect_uri points to one of these hostnames it
 * runs cross-origin from the opener and uses `postMessage(..., '*')`.
 * We gate trust on the receiving side: any message whose
 * `event.origin` is NOT in this list (and not the opener's own
 * origin) is silently dropped.
 */
const TRUSTED_ORIGINS: readonly string[] = [
  'https://admin.comprom.org',
  'https://dev-admin.comprom.org',
  'https://admin-website.igor-ganov.workers.dev',
  'http://localhost:5173',
  'http://localhost:4173',
]

const isTrustedOrigin = (origin: string): boolean =>
  typeof globalThis.location !== 'undefined' &&
  (origin === globalThis.location.origin || TRUSTED_ORIGINS.includes(origin))

/**
 * Creates message event handler for OAuth popup.
 * @param onSuccess - Callback on successful authentication
 * @param onError - Optional callback on authentication error
 * @param cleanup - Cleanup function for listeners and popup
 * @returns Message event handler function
 */
export const createMessageHandler =
  (
    onSuccess: (user: User) => void,
    onError: ((error: string) => void) | undefined,
    cleanup: () => void
  ) =>
  (event: MessageEvent) => {
    if (typeof globalThis.location === 'undefined') return
    if (!isTrustedOrigin(event.origin)) return
    const msg = decodeOrUndefined(OAuthMessageSchema)(event.data)
    if (!msg) return
    if (msg.type === 'github-oauth-success')
      handleToken(msg.token, onSuccess, onError).finally(cleanup)
    else if (msg.type === 'github-oauth-code')
      handleCode(msg.code, onSuccess, onError).finally(cleanup)
    else {
      onError?.(msg.error ?? 'Authentication failed')
      cleanup()
    }
  }
