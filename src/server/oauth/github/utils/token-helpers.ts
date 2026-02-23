/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'

/**
 * Request access token from GitHub
 */
export const requestToken = (
  code: string,
  config: { clientId?: string; clientSecret?: string; callbackUrl?: string }
) =>
  Effect.tryPromise({
    try: () =>
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
        r => r.json() as Promise<{ access_token?: string; error?: string }>
      ),
    catch: () => new Error('Failed to fetch access token'),
  })

/**
 * Extract token from response
 */
export const extractToken = (tokenData: {
  access_token?: string
  error?: string
}) =>
  tokenData.error || !tokenData.access_token
    ? Effect.fail(new Error('Failed to get access token'))
    : Effect.succeed(tokenData.access_token)
