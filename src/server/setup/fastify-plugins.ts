/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import fastifyCookie from '@fastify/cookie'
import middie from '@fastify/middie'
import fastifySession from '@fastify/session'
import { Effect, pipe } from 'effect'
import Fastify from 'fastify'

/**
 * Setup Fastify server with plugins
 */
export const setupFastify = (isMockOAuth: boolean) =>
  pipe(
    Effect.sync(() => Fastify({ logger: true })),
    Effect.tap(fastify =>
      Effect.sync(() => {
        if (isMockOAuth) {
          fastify.log.info(
            '🧪 MOCK OAUTH MODE ENABLED - GitHub OAuth will be mocked'
          )
        } else {
          fastify.log.info('🔐 Real GitHub OAuth mode')
        }
      })
    ),
    Effect.flatMap(fastify =>
      pipe(
        Effect.promise(() => fastify.register(fastifyCookie)),
        Effect.flatMap(() =>
          Effect.promise(() =>
            fastify.register(fastifySession, {
              secret:
                process.env.SESSION_SECRET ||
                'a-very-secret-key-change-in-production-minimum-32-characters-required',
              cookie: {
                secure: false,
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7,
              },
            })
          )
        ),
        Effect.flatMap(() => Effect.promise(() => fastify.register(middie))),
        Effect.map(() => fastify)
      )
    )
  )
