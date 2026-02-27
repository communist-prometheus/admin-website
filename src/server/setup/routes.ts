/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type Fastify from 'fastify'
import { registerGitHubApiRoutes } from '../api/github/routes'
import { registerGitHubContentRoutes } from '../github/routes'
import {
  type GitHubOAuthConfig,
  registerGitHubOAuthRoutes,
} from '../oauth/github/routes'
import type { RenderPageConfig } from '../ssr/page-renderer'
import {
  handleFavicon,
  handleRobotsTxt,
  handleSitemap,
  handleSsr,
} from './routes/handlers'

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
    registerGitHubApiRoutes(fastify)
    registerGitHubContentRoutes(fastify)

    if (isProduction) {
      fastify.get('/favicon.ico', handleFavicon(resolveDistPath))
      fastify.get('/robots.txt', handleRobotsTxt(resolveDistPath))
      fastify.get('/sitemap.xml', handleSitemap(resolveDistPath))
    }

    fastify.get('*', handleSsr(renderConfig))

    return fastify
  })
