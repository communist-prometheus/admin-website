import { fetchGitHubUser } from '@/composables/useAuth/fetch-github-user'
import { saveToken } from '@/composables/useAuth/token-storage'
import type { User } from '@/types/user'

/**
 * Save the GitHub access token, fetch the user profile, hand off.
 * @param token - GitHub access token
 * @param onSuccess - Callback with complete User
 * @param onError - Optional error callback
 */
export const handleToken = async (
  token: string,
  onSuccess: (user: User) => void,
  onError: ((error: string) => void) | undefined
): Promise<void> => {
  try {
    saveToken(token)
    const user = await fetchGitHubUser(token)
    onSuccess(user)
  } catch {
    onError?.('Failed to fetch user after token exchange')
  }
}
