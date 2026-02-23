import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'
import type { GitHubOAuthConfig } from './oauth/github/routes'
import { setupFastify } from './setup/fastify-plugins'
import { setupRenderer } from './setup/renderer'
import { setupRoutes } from './setup/routes'

const __dirname = dirname(fileURLToPath(import.meta.url))
const isProduction = process.env.NODE_ENV === 'production'
const isMockOAuth = process.env.MOCK_OAUTH === 'true'

const resolveDistPath = (path: string): string =>
  resolve(__dirname, '../../dist', path)

const oauthConfig: GitHubOAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: process.env.GITHUB_CALLBACK_URL,
  isMockMode: isMockOAuth,
}

const startServer = (fastify: ReturnType<typeof Fastify>) =>
  Effect.tryPromise({
    try: () => fastify.listen({ port: 3000 }),
    catch: err => err as Error,
  })

/**
 * Main server program
 */
export const program = pipe(
  setupFastify(isMockOAuth),
  Effect.flatMap(fastify =>
    pipe(
      setupRenderer(fastify, isProduction, __dirname, resolveDistPath),
      Effect.flatMap(({ config }) =>
        setupRoutes(
          fastify,
          config,
          oauthConfig,
          isProduction,
          resolveDistPath
        )
      ),
      Effect.flatMap(startServer)
    )
  )
)
