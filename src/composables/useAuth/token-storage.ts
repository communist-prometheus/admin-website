import { readCookie } from './cookie-token'
import { clearProfile } from './profile-cache'

const TOKEN_KEY = 'gh_token'

/**
 * Save GitHub token to localStorage.
 * @param token - GitHub access token
 */
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Load GitHub token from localStorage or cookie fallback.
 * When found in cookie, persists to localStorage.
 * @returns Token string or undefined
 */
export const loadToken = (): string | undefined => {
  const stored = localStorage.getItem(TOKEN_KEY) ?? undefined
  if (stored) return stored

  const fromCookie = readCookie(TOKEN_KEY)
  if (fromCookie) saveToken(fromCookie)
  return fromCookie
}

/**
 * Remove GitHub token from localStorage.
 */
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY)
  clearProfile()
}
