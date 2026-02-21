import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import fastifyStatic from '@fastify/static'
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'

const readManifests = (resolveDistPath: (path: string) => string) => ({
  ssrManifest: JSON.parse(
    readFileSync(resolveDistPath('client/.vite/ssr-manifest.json'), 'utf-8')
  ),
  clientManifest: JSON.parse(
    readFileSync(resolveDistPath('client/.vite/manifest.json'), 'utf-8')
  ),
})

/**
 * Sets up static asset serving for production build.
 * @param fastify - Fastify instance
 * @param __dirname - Server directory path
 * @returns Effect containing SSR and client manifests
 */
export const setupProductionAssets = (
  fastify: ReturnType<typeof Fastify>,
  __dirname: string
) =>
  pipe(
    Effect.succeed((path: string) => resolve(__dirname, '../dist', path)),
    Effect.flatMap(resolveDistPath =>
      pipe(
        Effect.promise(() =>
          fastify.register(fastifyStatic, {
            root: resolveDistPath('client/assets'),
            prefix: '/assets/',
          })
        ),
        Effect.map(() => readManifests(resolveDistPath))
      )
    )
  )
