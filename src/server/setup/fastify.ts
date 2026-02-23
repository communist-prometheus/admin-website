import fastifyCookie from '@fastify/cookie'
import middie from '@fastify/middie'
import fastifySession from '@fastify/session'
import { Effect, pipe } from 'effect'
import Fastify from 'fastify'

const sessionConfig = {
  secret:
    process.env['SESSION_SECRET'] ||
    'a-very-secret-key-change-in-production-minimum-32-characters-required',
  cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 * 7 },
}

const registerPlugins = (fastify: ReturnType<typeof Fastify>) =>
  pipe(
    Effect.tryPromise({
      try: async () => await fastify.register(fastifyCookie),
      catch: () => new Error('Failed to register cookie plugin'),
    }),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: async () =>
          await fastify.register(fastifySession, sessionConfig),
        catch: () => new Error('Failed to register session plugin'),
      })
    ),
    Effect.flatMap(() =>
      Effect.tryPromise({
        try: async () => await fastify.register(middie),
        catch: () => new Error('Failed to register middie plugin'),
      })
    ),
    Effect.map(() => fastify)
  )

/**
 * Creates and configures Fastify server with cookies, session, and middleware support.
 * @returns Effect containing configured Fastify instance
 */
export const createFastifyServer = () =>
  pipe(
    Effect.succeed(Fastify({ logger: true })),
    Effect.flatMap(registerPlugins)
  )
