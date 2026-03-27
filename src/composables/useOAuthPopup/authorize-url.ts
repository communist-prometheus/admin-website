import { getAuthConfig } from '@/config/auth'
import { generateCodeChallenge, generateCodeVerifier } from '../useAuth/pkce'
import { saveVerifier } from '../useAuth/pkce-storage'

const GITHUB_AUTHORIZE = 'https://github.com/login/oauth/authorize'

/**
 * Build GitHub PKCE authorize URL and save verifier.
 * @returns Popup URL string
 */
export const buildAuthorizeUrl = async (): Promise<string> => {
  const { clientId, redirectUri, scopes } = getAuthConfig()
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)
  saveVerifier(verifier)
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })
  return `${GITHUB_AUTHORIZE}?${params}`
}
