import { getAuthConfig } from '@/config/auth'
import { generateCodeChallenge, generateCodeVerifier } from '../useAuth/pkce'
import { saveState, saveVerifier } from '../useAuth/pkce-storage'

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize'

/**
 * Build GitHub PKCE authorize URL and save verifier + state.
 * `state` reuses the verifier generator (32 crypto-random bytes,
 * base64url) and is validated in AuthCallbackView — login-CSRF
 * protection that PKCE alone does not provide.
 * @returns Popup URL string
 */
export const buildAuthorizeUrl = async (): Promise<string> => {
  const { clientId, redirectUri, scopes } = getAuthConfig()
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  const state = generateCodeVerifier()
  saveVerifier(verifier)
  saveState(state)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    state,
  })
  return `${GITHUB_AUTHORIZE}?${params}`
}
