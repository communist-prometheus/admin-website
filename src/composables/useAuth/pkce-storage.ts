const VERIFIER_KEY = 'pkce_verifier'
const STATE_KEY = 'oauth_state'

const loadAndClear = (key: string): string | undefined => {
  const v = localStorage.getItem(key) ?? undefined
  localStorage.removeItem(key)
  return v
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
export const loadAndClearVerifier = (): string | undefined =>
  loadAndClear(VERIFIER_KEY)

/**
 * Save the OAuth `state` value for the in-flight authorize round
 * trip. PKCE protects against code interception but not against
 * login CSRF — `state` binds the callback to the session that
 * initiated the flow.
 * @param state - Random state value sent to the authorize endpoint
 */
export const saveState = (state: string): void => {
  localStorage.setItem(STATE_KEY, state)
}

/**
 * Load and remove the saved OAuth `state`.
 * @returns State string or undefined
 */
export const loadAndClearState = (): string | undefined =>
  loadAndClear(STATE_KEY)
