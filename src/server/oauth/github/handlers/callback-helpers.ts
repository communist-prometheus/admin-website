/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { FastifyRequest } from 'fastify'
import { fetchAccessToken, fetchGitHubUser, saveSession } from '../utils'

/**
 * Mock user data for testing
 */
export const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
}

/**
 * Get user data from GitHub OAuth
 */
export const getUserData = (
  code: string,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) =>
  config.isMockMode
    ? Effect.succeed({ ...mockUser, accessToken: 'mock-token' })
    : pipe(
        fetchAccessToken(code, config),
        Effect.flatMap(accessToken =>
          pipe(
            fetchGitHubUser(accessToken),
            Effect.map(user => ({ ...user, accessToken }))
          )
        )
      )

/**
 * Store user data in session
 */
export const storeUserInSession = (
  request: FastifyRequest,
  userData: {
    login?: string
    name?: string
    avatar_url?: string
    accessToken?: string
  }
) =>
  Effect.sync(() => {
    // @ts-expect-error - fastify-session typing issue
    request.session.github_user = {
      username: userData.login,
      name: userData.name,
      avatar: userData.avatar_url,
      accessToken: userData.accessToken,
    }
    request.log.info(
      {
        username: userData.login,
        name: userData.name,
        hasToken: !!userData.accessToken,
        tokenLength: userData.accessToken?.length,
      },
      'GitHub OAuth: User stored in session'
    )
  })

/**
 * Handle mock OAuth redirect
 */
export const handleMockRedirect = (
  request: FastifyRequest,
  reply: import('fastify').FastifyReply
) =>
  pipe(
    saveSession(request),
    Effect.tap(() => {
      request.log.info('🧪 Mock OAuth: Session saved, redirecting to home')
    }),
    Effect.map(() => reply.redirect('/'))
  )
