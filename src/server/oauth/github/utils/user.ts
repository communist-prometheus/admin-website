/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'

/**
 * Fetch user data from GitHub
 */
export const fetchGitHubUser = (accessToken: string) =>
  Effect.tryPromise({
    try: () =>
      fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }).then(
        r =>
          r.json() as Promise<{
            login?: string
            name?: string
            avatar_url?: string
          }>
      ),
    catch: () => new Error('Failed to fetch user data'),
  })
