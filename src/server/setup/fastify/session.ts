/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import fastifySession from '@fastify/session'
import { Effect } from 'effect'
import type Fastify from 'fastify'

/**
 * Register Fastify session plugin
 */
export const registerSession = (fastify: ReturnType<typeof Fastify>) =>
  Effect.tryPromise({
    try: async () =>
      await fastify.register(fastifySession, {
        secret:
          process.env.SESSION_SECRET ||
          'a-very-secret-key-change-in-production-minimum-32-characters-required',
        cookie: {
          secure: false,
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      }),
    catch: () => new Error('Failed to register session plugin'),
  })
