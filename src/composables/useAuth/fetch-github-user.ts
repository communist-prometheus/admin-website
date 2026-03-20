import type { User } from '@/types/user'

const API_URL = 'https://api.github.com/user'

/**
 * Fetch authenticated GitHub user profile.
 * @param token - GitHub access token
 * @returns User object with username, name, avatar, accessToken
 */
export const fetchGitHubUser = async (token: string): Promise<User> => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status}`)
  }

  const data: {
    login: string
    name: string | undefined
    avatar_url: string
  } = await res.json()

  return {
    username: data.login,
    name: data.name ?? data.login,
    avatar: data.avatar_url,
    accessToken: token,
  }
}
