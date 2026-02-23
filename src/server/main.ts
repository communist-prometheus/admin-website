import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Effect, pipe } from 'effect'
import type Fastify from 'fastify'
import type { GitHubOAuthConfig } from './oauth/github/routes'
import { setupFastify } from './setup/fastify-plugins'
import { setupRenderer } from './setup/renderer'
import { setupRoutes } from './setup/routes'

/**
 * Current server directory path
 */
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Production mode flag from environment
 */
const isProduction = process.env.NODE_ENV === 'production'

/**
 * Mock OAuth mode flag from environment
 */
const isMockOAuth = process.env.MOCK_OAUTH === 'true'

/**
 * Resolve path relative to dist directory
 * @param path - Path to resolve
 * @returns Absolute path to dist location
 */
const resolveDistPath = (path: string): string =>
  resolve(__dirname, '../../dist', path)

/**
 * GitHub OAuth configuration from environment
 */
const oauthConfig: GitHubOAuthConfig = {
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackUrl: process.env.GITHUB_CALLBACK_URL,
  isMockMode: isMockOAuth,
}

/**
 * Start Fastify server on port 3000
 * @param fastify - Configured Fastify instance
 * @returns Effect that starts the server
 */
const startServer = (fastify: ReturnType<typeof Fastify>) =>
  Effect.tryPromise({
    try: () => fastify.listen({ port: 3000 }),
    catch: err => err as Error,
  })

/**
 * Main server program that sets up and starts the application
 * Composes Fastify setup, renderer setup, routes, and server start
 * @returns Effect that represents the complete server startup flow
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
