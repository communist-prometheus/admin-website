import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { getMockUser } from './mock-user'
import { saveProfile } from './profile-cache'
import { loadToken, saveToken } from './token-storage'

/**
 * Resolve token: dev injected, or from localStorage.
 * @returns Token string or undefined
 */
const resolveToken = (): string | undefined => {
  const devToken = import.meta.env.VITE_DEV_TOKEN as string | undefined
  if (devToken) {
    saveToken(devToken)
    return devToken
  }
  return loadToken()
}

/**
 * Get initial user from token or mock.
 * Saves profile to cache on successful fetch.
 * @returns Promise resolving to User or null
 */
export const getInitialUser = async (): Promise<User | null> => {
  const token = resolveToken()
  if (!token) return null
  if (import.meta.env.VITE_MOCK_AUTH === 'true') {
    return getMockUser()
  }
  try {
    const user = await fetchGitHubUser(token)
    saveProfile({
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    })
    return user
  } catch {
    return null
  }
}
