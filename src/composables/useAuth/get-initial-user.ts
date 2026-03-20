import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { getMockUser } from './mock-user'
import { loadToken } from './token-storage'

/**
 * Get initial user from localStorage token or mock.
 * In mock mode, requires token in localStorage to return user.
 * @returns Promise resolving to User or null
 */
export const getInitialUser = async (): Promise<User | null> => {
  const token = loadToken()
  if (!token) return null
  if (import.meta.env.VITE_MOCK_AUTH === 'true') {
    return getMockUser()
  }
  try {
    return await fetchGitHubUser(token)
  } catch {
    return null
  }
}
