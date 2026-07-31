import type { User } from '@/types/user'

const API_URL = 'https://api.github.com/user'

/**
 * Thrown when GitHub rejects the token itself (401/403). Distinguished from
 * transient errors (network, 5xx) so callers clear the session on a dead
 * token but preserve it across a blip.
 */
export class GitHubAuthError extends Error {}

interface GitHubUserData {
  readonly login: string
  readonly name: string | undefined
  readonly avatar_url: string
}

const raise = (error: Error): never => {
  throw error
}

const httpError = (status: number): Error =>
  status === 401 || status === 403
    ? new GitHubAuthError(`GitHub auth error: ${status}`)
    : new Error(`GitHub API error: ${status}`)

const toUser = (data: GitHubUserData, token: string): User => ({
  username: data.login,
  name: data.name ?? data.login,
  avatar: data.avatar_url,
  accessToken: token,
})

/**
 * Fetch the authenticated GitHub user profile.
 * @param token - GitHub access token
 * @returns User object with username, name, avatar, accessToken
 * @throws GitHubAuthError on 401/403; a plain Error on other failures
 */
export const fetchGitHubUser = async (token: string): Promise<User> => {
  const res = await fetch(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data: GitHubUserData = res.ok
    ? await res.json()
    : raise(httpError(res.status))
  return toUser(data, token)
}
