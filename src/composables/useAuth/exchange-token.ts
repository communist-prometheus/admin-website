import { Effect, pipe } from 'effect'

/**
 * Get the token exchange endpoint URL.
 * @returns Token exchange endpoint URL
 */
const getTokenUrl = (): string =>
  import.meta.env.VITE_TOKEN_PROXY ?? '/api/oauth/token'

/**
 * Build URL-encoded token exchange body.
 * @param code - OAuth authorization code
 * @param verifier - PKCE code verifier
 * @returns URLSearchParams body
 */
const buildTokenBody = (code: string, verifier: string): URLSearchParams =>
  new URLSearchParams({
    client_id: import.meta.env.VITE_GITHUB_CLIENT_ID ?? '',
    code,
    code_verifier: verifier,
  })

interface TokenData {
  readonly access_token?: string
  readonly error?: string
}

/**
 * Exchange OAuth code + PKCE verifier for access token.
 * @param code - Authorization code from callback
 * @param verifier - PKCE code verifier
 * @returns GitHub access token
 */
export const exchangeCodeForToken = (
  code: string,
  verifier: string
): Promise<string> =>
  pipe(
    Effect.tryPromise(() =>
      fetch(getTokenUrl(), {
        method: 'POST',
        body: buildTokenBody(code, verifier),
      })
    ),
    Effect.flatMap(res =>
      Effect.tryPromise((): Promise<TokenData> => res.json())
    ),
    Effect.filterOrFail(
      (d): d is TokenData & { access_token: string } =>
        !d.error && !!d.access_token,
      d => new Error(d.error ?? 'Token exchange failed')
    ),
    Effect.map(d => d.access_token),
    Effect.runPromise
  )
