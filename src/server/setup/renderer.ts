/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { readFileSync } from 'node:fs'
import fastifyStatic from '@fastify/static'
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'
import type { RenderPageConfig } from '../ssr/page-renderer'

/**
 * Setup production assets
 */
const setupProductionAssets = (
  fastify: ReturnType<typeof Fastify>,
  resolveDistPath: (path: string) => string
) =>
  pipe(
    Effect.promise(() =>
      fastify.register(fastifyStatic, {
        root: resolveDistPath('client/assets'),
        prefix: '/assets/',
      })
    ),
    Effect.map(() => ({
      ssrManifest: JSON.parse(
        readFileSync(
          resolveDistPath('client/.vite/ssr-manifest.json'),
          'utf-8'
        )
      ),
      clientManifest: JSON.parse(
        readFileSync(resolveDistPath('client/.vite/manifest.json'), 'utf-8')
      ),
    }))
  )

/**
 * Setup Vite dev server
 */
const setupViteServer = (fastify: ReturnType<typeof Fastify>) =>
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

/**
 * Setup SSR renderer
 */
export const setupRenderer = (
  fastify: ReturnType<typeof Fastify>,
  isProduction: boolean,
  dirname: string,
  resolveDistPath: (path: string) => string
): Effect.Effect<{ config: RenderPageConfig }, never, never> =>
  isProduction
    ? setupProductionAssets(fastify, resolveDistPath).pipe(
        Effect.map(({ ssrManifest, clientManifest }) => ({
          config: {
            isProduction,
            dirname,
            viteServer: undefined,
            ssrManifest,
            clientManifest,
          } as RenderPageConfig,
        }))
      )
    : setupViteServer(fastify).pipe(
        Effect.map(({ viteServer, ssrManifest, clientManifest }) => ({
          config: {
            isProduction,
            dirname,
            viteServer,
            ssrManifest,
            clientManifest,
          } as RenderPageConfig,
        }))
      )
