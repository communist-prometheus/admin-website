import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { loadToken } from './token-storage'

/**
 * Auth status response shape.
 */
interface AuthStatus {
  readonly authenticated: boolean
  readonly user?: User
}

/**
 * Check authentication status via localStorage token.
 * @returns Auth status with optional user
 */
export const checkAuthStatus = async (): Promise<AuthStatus> => {
  const token = loadToken()
  if (!token) return { authenticated: false }
  try {
    const user = await fetchGitHubUser(token)
    return { authenticated: true, user }
  } catch {
    return { authenticated: false }
  }
}
