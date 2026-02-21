import { Effect } from 'effect'
import type { GitHubOAuthConfig } from './types'

/**
 * Exchanges OAuth authorization code for GitHub access token.
 * @param config - GitHub OAuth configuration
 * @param code - Authorization code from GitHub OAuth callback
 * @returns Effect containing token response with access_token or error
 */
export const fetchToken = (config: GitHubOAuthConfig, code: string) =>
  Effect.tryPromise(() =>
    fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        redirect_uri: config.callbackUrl,
      }),
    }).then(
      res =>
        res.json() as Promise<{
          access_token?: string
          error?: string
        }>
    )
  )

/**
 * Fetches authenticated user data from GitHub API.
 * @param token - GitHub access token
 * @returns Effect containing user data from GitHub API
 */
export const fetchUser = (token: string) =>
  Effect.tryPromise(() =>
    fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }).then(
      res =>
        res.json() as Promise<{
          login?: string
          name?: string
          avatar_url?: string
        }>
    )
  )
