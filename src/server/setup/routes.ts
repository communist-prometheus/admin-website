/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type Fastify from 'fastify'
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
  handleSW,
} from './routes/handlers'

/**
 * Setup routes — only OAuth + SSR remain.
 * GitHub API is now handled by the Service Worker.
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
      fastify.get('/sw.js', handleSW(resolveDistPath))
      fastify.get('/favicon.ico', handleFavicon(resolveDistPath))
      fastify.get('/robots.txt', handleRobotsTxt(resolveDistPath))
      fastify.get('/sitemap.xml', handleSitemap(resolveDistPath))
    }

    fastify.get('*', handleSsr(renderConfig))

    return fastify
  })
