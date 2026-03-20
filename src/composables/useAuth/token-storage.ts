const TOKEN_KEY = 'gh_token'
const VERIFIER_KEY = 'pkce_verifier'

/**
 * Save GitHub token to localStorage.
 * @param token - GitHub access token
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Load GitHub token from localStorage.
 * @returns Token string or undefined
 */
export const loadToken = (): string | undefined =>
  localStorage.getItem(TOKEN_KEY) ?? undefined

/**
 * Remove GitHub token from localStorage.
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Save PKCE verifier to localStorage.
 * Uses localStorage because the popup navigates away
 * to github.com and back — sessionStorage is lost.
 * @param verifier - PKCE code verifier
 */
export const saveVerifier = (verifier: string): void => {
  localStorage.setItem(VERIFIER_KEY, verifier)
}

/**
 * Load and remove PKCE verifier from localStorage.
 * @returns Verifier string or undefined
 */
export const loadAndClearVerifier = (): string | undefined => {
  const v = localStorage.getItem(VERIFIER_KEY) ?? undefined
  localStorage.removeItem(VERIFIER_KEY)
  return v
}
