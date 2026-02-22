/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { FastifyRequest } from 'fastify'

/**
 * Fetch access token from GitHub
 */
export const fetchAccessToken = (
  code: string,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) =>
  pipe(
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
    }),
    Effect.flatMap(tokenData =>
      tokenData.error || !tokenData.access_token
        ? Effect.fail(new Error('Failed to get access token'))
        : Effect.succeed(tokenData.access_token)
    )
  )

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

/**
 * Save session
 */
export const saveSession = (request: FastifyRequest) =>
  Effect.async<void, Error>(resume => {
    request.session.save((err: Error | null) => {
      if (err) resume(Effect.fail(err))
      else resume(Effect.succeed(undefined))
    })
  })
