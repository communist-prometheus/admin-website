import { exchangeCodeForToken } from '@/composables/useAuth/exchange-token'
import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { loadAndClearVerifier } from '@/composables/useAuth/pkce-storage'
import { saveToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'

/**
 * Hand the auth code to the opener window and close the popup.
 *
 * The PKCE verifier lives in the opener's localStorage. When the
 * popup runs on a different origin (centralized callback URL) the
 * popup cannot reach that storage, so it just forwards the code.
 * targetOrigin '*' is safe — the opener gates by the TRUSTED_ORIGINS
 * allowlist in useOAuthPopup/handlers.ts.
 * @param code - GitHub authorization code
 */
export const notifyOpenerCode = (code: string): void => {
  globalThis.opener?.postMessage({ type: 'github-oauth-code', code }, '*')
  globalThis.close()
}

interface SameTabResult {
  readonly status: 'ok' | 'missing-verifier' | 'error'
  readonly user?: User
  readonly message?: string
}

/**
 * Run the PKCE token exchange + user fetch and pack the outcome into
 * a tagged result. Pulled out so `completeSameTab` stays a small
 * dispatcher and the function-length linter is happy.
 * @param code - GitHub authorization code
 * @param verifier - PKCE verifier loaded from this origin's storage
 * @returns Tagged result for the caller
 */
const runExchange = async (
  code: string,
  verifier: string
): Promise<SameTabResult> => {
  try {
    const token = await exchangeCodeForToken(code, verifier)
    saveToken(token)
    const user = await fetchGitHubUser(token)
    return { status: 'ok', user }
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Auth failed',
    }
  }
}

/**
 * Same-tab fallback: the callback opened directly without a popup.
 * Reads the verifier from this origin's localStorage and finishes the
 * PKCE exchange in place. Returns a tagged result the view turns into
 * UI status / navigation.
 * @param code - GitHub authorization code
 * @returns Tagged result describing what happened
 */
export const completeSameTab = async (
  code: string
): Promise<SameTabResult> => {
  const verifier = loadAndClearVerifier()
  return verifier === undefined
    ? { status: 'missing-verifier' }
    : runExchange(code, verifier)
}
