/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type Fastify from 'fastify'
import {
  type GitHubOAuthConfig,
  registerGitHubOAuthRoutes,
} from '../oauth/github/routes'
import type { RenderPageConfig } from '../ssr/page-renderer'
import { handleFavicon, handleSsr } from './routes/handlers'

/**
 * Setup routes
 */
export const setupRoutes = (
  fastify: ReturnType<typeof Fastify>,
  renderConfig: RenderPageConfig,
  oauthConfig: GitHubOAuthConfig,
  isProduction: boolean,
  resolveDistPath: (path: string) => string
) =>
  Effect.sync(() => {
    registerGitHubOAuthRoutes(fastify, oauthConfig)

    if (isProduction) {
      fastify.get('/favicon.ico', handleFavicon(resolveDistPath))
    }

    fastify.get('*', handleSsr(renderConfig))

    return fastify
  })
