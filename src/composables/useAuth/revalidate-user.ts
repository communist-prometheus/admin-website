import type { User } from '@/types/user'
import { fetchGitHubUser } from './fetch-github-user'
import { saveProfile } from './profile-cache'
import { loadToken } from './token-storage'

/**
 * Revalidate user by fetching fresh profile from GitHub.
 * Updates the profile cache on success.
 * @returns Fresh User or undefined on failure
 */
export const revalidateUser = async (): Promise<User | undefined> => {
  const token = loadToken()
  if (!token) return undefined
  try {
    const user = await fetchGitHubUser(token)
    saveProfile({
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    })
    return user
  } catch {
    return undefined
  }
}
