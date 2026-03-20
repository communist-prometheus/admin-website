import type { User } from '@/types/user'
import { loadProfile } from './profile-cache'
import { loadToken } from './token-storage'

/**
 * Build user from cached profile and stored token.
 * Returns instantly without network calls.
 * @returns Cached User or undefined
 */
export const getCachedUser = (): User | undefined => {
  const token = loadToken()
  if (!token) return undefined
  const profile = loadProfile()
  if (!profile) return undefined
  return { ...profile, accessToken: token }
}
