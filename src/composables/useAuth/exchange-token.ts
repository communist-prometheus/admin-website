/**
 * Get the token exchange endpoint URL.
 * Dev: Vite proxy at /api/oauth/token.
 * Prod: VITE_TOKEN_PROXY env or same relative path.
 * @returns Token endpoint URL
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

/**
 * Exchange OAuth code + PKCE verifier for access token.
 * @param code - Authorization code from callback
 * @param verifier - PKCE code verifier
 * @returns GitHub access token
 */
export const exchangeCodeForToken = async (
  code: string,
  verifier: string
): Promise<string> => {
  const res = await fetch(getTokenUrl(), {
    method: 'POST',
    body: buildTokenBody(code, verifier),
  })
  const data: {
    access_token?: string
    error?: string
  } = await res.json()
  if (data.error || !data.access_token) {
    throw new Error(data.error ?? 'Token exchange failed')
  }
  return data.access_token
}
