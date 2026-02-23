/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type Fastify from 'fastify'
import type { RenderPageConfig } from '../ssr/page-renderer'
import { setupProductionAssets } from './renderer/production'
import { setupViteServer } from './renderer/vite'

/**
 * Setup SSR renderer
 */
export const setupRenderer = (
  fastify: ReturnType<typeof Fastify>,
  isProduction: boolean,
  dirname: string,
  resolveDistPath: (path: string) => string
): Effect.Effect<{ config: RenderPageConfig }, Error, never> =>
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
