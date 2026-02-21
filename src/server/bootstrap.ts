import { Effect, pipe } from 'effect'
import type { FastifyInstance } from 'fastify'
import type { ViteDevServer } from 'vite'
import { config } from './config'
import {
  createFastifyServer,
  setupProductionAssets,
  setupViteDevServer,
} from './setup'

const setupAssets = (fastify: FastifyInstance, __dirname: string) =>
  config.isProduction
    ? setupProductionAssets(fastify, __dirname)
    : Effect.succeed({ ssrManifest: undefined, clientManifest: undefined })

const setupVite = (__dirname: string) =>
  config.isProduction
    ? Effect.succeed(undefined as ViteDevServer | undefined)
    : setupViteDevServer(__dirname)

const setupMiddleware = (
  fastify: FastifyInstance,
  viteServer?: ViteDevServer
) =>
  viteServer
    ? Effect.sync(() => fastify.use(viteServer.middlewares))
    : Effect.succeed(undefined)

/**
 * Bootstraps complete server setup with Fastify, assets, and Vite.
 * @param __dirname - Server directory path
 * @returns Effect containing fastify instance, assets manifests, and vite server
 */
export const bootstrapServer = (__dirname: string) =>
  pipe(
    createFastifyServer(),
    Effect.tap(fastify =>
      Effect.sync(() =>
        fastify.log.info(
          config.isMockOAuth
            ? '🧪 MOCK OAUTH MODE ENABLED'
            : '🔐 Real GitHub OAuth mode'
        )
      )
    ),
    Effect.flatMap(fastify =>
      pipe(
        Effect.all([setupAssets(fastify, __dirname), setupVite(__dirname)]),
        Effect.tap(([_, viteServer]) => setupMiddleware(fastify, viteServer)),
        Effect.map(([assets, viteServer]) => ({
          fastify,
          assets,
          viteServer,
        }))
      )
    )
  )
