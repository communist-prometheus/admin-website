/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'

/**
 * Setup Vite dev server
 */
export const setupViteServer = (fastify: ReturnType<typeof Fastify>) =>
  pipe(
    Effect.tryPromise({
      try: async () => await import('vite'),
      catch: () => new Error('Failed to import vite'),
    }),
    Effect.flatMap(vite =>
      Effect.tryPromise({
        try: async () =>
          await vite.createServer({
            server: { middlewareMode: true },
            appType: 'custom',
          }),
        catch: () => new Error('Failed to create Vite server'),
      })
    ),
    Effect.tap(viteServer =>
      Effect.tryPromise({
        try: async () => await fastify.use(viteServer.middlewares),
        catch: () => new Error('Failed to register Vite middleware'),
      })
    ),
    Effect.map(viteServer => ({
      viteServer,
      ssrManifest: undefined,
      clientManifest: undefined,
    }))
  )
