import { extractString } from '@/validation/extract-string'
import { exchangeCodeForToken } from './exchange-token'
import { mintSession } from './mint-session'
import { loadAndClearState, loadAndClearVerifier } from './pkce-storage'
import { saveToken } from './token-storage'

type QueryValue = string | null | undefined | (string | null)[]

const fail = (message: string): never => {
  throw new Error(message)
}

const requireStateMatch = (
  state: string | undefined,
  expected: string | undefined
): string =>
  expected !== undefined && state === expected
    ? expected
    : fail('State mismatch — restart the sign-in flow')

/**
 * Validate the OAuth callback query and complete the PKCE exchange.
 * Enforces the `state` round trip (login-CSRF gate: the callback
 * must carry the value saved by the SAME browser session that
 * started the flow), persists the token, and fire-and-forgets the
 * parent-domain SSO cookie mint.
 * @param codeRaw - route.query.code as received
 * @param stateRaw - route.query.state as received
 * @returns The GitHub access token
 * @throws Error with a user-facing message on any validation failure
 */
export const completeCallback = async (
  codeRaw: QueryValue,
  stateRaw: QueryValue
): Promise<string> => {
  const code = extractString(codeRaw) ?? fail('Missing code or verifier')
  const verifier = loadAndClearVerifier() ?? fail('Missing code or verifier')
  requireStateMatch(extractString(stateRaw), loadAndClearState())
  const token = await exchangeCodeForToken(code, verifier)
  saveToken(token)
  // Mint the parent-domain SSO cookie so subsequent calls to
  // *.comprom.org workers carry auth automatically. Fire-and-forget
  // — if the user is not yet on the admins team, the SPA still
  // loads but cookie-gated workers will 401 until membership lands.
  void mintSession(token)
  return token
}
