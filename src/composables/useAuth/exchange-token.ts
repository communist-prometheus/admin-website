import { postToken } from './post-token'
import {
  type GitHubSession,
  sessionFromResponse,
  type TokenResponse,
} from './session'

const clientId = (): string => import.meta.env.VITE_GITHUB_CLIENT_ID ?? ''

const raise = (message: string): never => {
  throw new Error(message)
}

/**
 * Turn a token response into a session, anchoring lifetimes to now.
 * Throws the GitHub error (or a generic message) when no token came back.
 * @param response - Proxied token response
 * @returns The resulting session
 */
const toSession = (response: TokenResponse): GitHubSession =>
  sessionFromResponse(response, Date.now()) ??
  raise(response.error ?? 'Token exchange failed')

const codeBody = (code: string, verifier: string): URLSearchParams =>
  new URLSearchParams({
    client_id: clientId(),
    code,
    code_verifier: verifier,
  })

const refreshBody = (refreshToken: string): URLSearchParams =>
  new URLSearchParams({
    client_id: clientId(),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  })

/**
 * Exchange an OAuth code + PKCE verifier for a fresh session.
 * @param code - Authorization code from the callback
 * @param verifier - PKCE code verifier
 * @returns The new session (access token + refresh material)
 */
export const exchangeCodeForSession = async (
  code: string,
  verifier: string
): Promise<GitHubSession> =>
  toSession(await postToken(codeBody(code, verifier)))

/**
 * Exchange a refresh token for a renewed (rotated) session.
 * @param refreshToken - The current refresh token
 * @returns The renewed session
 */
export const refreshSession = async (
  refreshToken: string
): Promise<GitHubSession> =>
  toSession(await postToken(refreshBody(refreshToken)))
