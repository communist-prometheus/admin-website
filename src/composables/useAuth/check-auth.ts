import type { User } from '@/types/user'

/**
 * Auth status response shape.
 */
interface AuthStatus {
  readonly authenticated: boolean
  readonly user?: User
}

/**
 * Check authentication status via API.
 * @returns Auth status with optional user
 */
export const checkAuthStatus = async (): Promise<AuthStatus> => {
  const res = await fetch('/api/auth/user')
  return res.json() as Promise<AuthStatus>
}
