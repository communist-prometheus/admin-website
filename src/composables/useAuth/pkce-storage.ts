const VERIFIER_KEY = 'pkce_verifier'

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
