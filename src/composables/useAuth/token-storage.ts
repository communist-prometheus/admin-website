import { clearProfile } from './profile-cache'
import { clearSession, loadSession, saveSession } from './session-storage'

/**
 * Save a bare access token (dev/mock/legacy paths that have no refresh
 * material). The OAuth flow persists a full session via saveSession.
 * @param token - GitHub access token
 */
export const saveToken = (token: string): void => {
  saveSession({ accessToken: token })
}

/**
 * Load the current access token.
 * @returns Token string or undefined
 */
export const loadToken = (): string | undefined => loadSession()?.accessToken

/** Remove the session (token + refresh material) and cached profile. */
export const clearToken = (): void => {
  clearSession()
  clearProfile()
}
