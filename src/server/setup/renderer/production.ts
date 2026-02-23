/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { readFileSync } from 'node:fs'
import fastifyStatic from '@fastify/static'
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'

/**
 * Setup production assets
 */
export const setupProductionAssets = (
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
