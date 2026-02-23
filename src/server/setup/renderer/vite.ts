/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'

/**
 * Setup Vite dev server
 */
export const setupViteServer = (fastify: ReturnType<typeof Fastify>) =>
  pipe(
    Effect.promise(() => import('vite')),
    Effect.flatMap(vite =>
      Effect.promise(() =>
        vite.createServer({
          server: { middlewareMode: true },
          appType: 'custom',
        })
      )
    ),
    Effect.tap(viteServer =>
      Effect.promise(() => fastify.use(viteServer.middlewares))
    ),
    Effect.map(viteServer => ({
      viteServer,
      ssrManifest: undefined,
      clientManifest: undefined,
    }))
  )
