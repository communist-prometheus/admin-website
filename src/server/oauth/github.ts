import { Effect, pipe } from 'effect'
import { fetchToken, fetchUser } from './github/api'
import { type GitHubOAuthConfig, mockUser, toUser } from './github/types'

export type { GitHubOAuthConfig }

/**
 * Authenticates user with GitHub OAuth or returns mock user in test mode.
 * @param config - GitHub OAuth configuration
 * @param code - OAuth authorization code
 * @returns Effect containing authenticated User or error
 */
export const authenticateWithGitHub = (
  config: GitHubOAuthConfig,
  code: string
) =>
  config.isMockMode
    ? Effect.succeed(mockUser)
    : pipe(
        fetchToken(config, code),
        Effect.flatMap(d =>
          d.error || !d.access_token
            ? Effect.fail(new Error('Invalid token'))
            : Effect.succeed(d.access_token)
        ),
        Effect.flatMap(fetchUser),
        Effect.map(toUser)
      )
