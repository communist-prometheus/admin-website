import type { User } from '@/types/user'

/**
 * Configuration for GitHub OAuth authentication.
 */
export interface GitHubOAuthConfig {
  readonly clientId: string
  readonly clientSecret: string
  readonly callbackUrl: string
  readonly isMockMode: boolean
}

/**
 * Mock user for testing OAuth flow without actual GitHub authentication.
 */
export const mockUser: User = {
  username: 'test-user',
  name: 'Test User',
  avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
  accessToken: 'mock-token',
}

/**
 * Transforms GitHub API user data into application User format.
 * @param data - GitHub API user response data
 * @param data.login - GitHub username
 * @param data.name - User's display name
 * @param data.avatar_url - URL to user's avatar image
 * @param data.accessToken - OAuth access token
 * @returns Normalized user object
 */
export const toUser = (data: {
  login?: string
  name?: string
  avatar_url?: string
  accessToken?: string
}): User => ({
  username: data.login ?? 'unknown',
  name: data.name ?? 'Unknown User',
  avatar: data.avatar_url ?? '',
  accessToken: data.accessToken ?? '',
})
