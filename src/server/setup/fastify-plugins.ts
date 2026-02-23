/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import Fastify from 'fastify'
import { registerCookie } from './fastify/cookie'
import { registerMiddie } from './fastify/middie'
import { registerSession } from './fastify/session'

const logOAuthMode = (
  isMockOAuth: boolean,
  fastify: ReturnType<typeof Fastify>
) =>
  Effect.sync(() => {
    if (isMockOAuth) {
      fastify.log.info(
        '🧪 MOCK OAUTH MODE ENABLED - GitHub OAuth will be mocked'
      )
    } else {
      fastify.log.info('🔐 Real GitHub OAuth mode')
    }
  })

const registerPlugins = (fastify: ReturnType<typeof Fastify>) =>
  pipe(
    registerCookie(fastify),
    Effect.flatMap(() => registerSession(fastify)),
    Effect.flatMap(() => registerMiddie(fastify)),
    Effect.map(() => fastify)
  )

/**
 * Setup Fastify server with plugins
 */
export const setupFastify = (isMockOAuth: boolean) =>
  pipe(
    Effect.sync(() => Fastify({ logger: true })),
    Effect.tap(fastify => logOAuthMode(isMockOAuth, fastify)),
    Effect.flatMap(registerPlugins)
  )
