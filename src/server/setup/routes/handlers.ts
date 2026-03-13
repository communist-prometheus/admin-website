/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { type RenderPageConfig, renderPage } from '../../ssr/page-renderer'

/**
 * Handle Service Worker script
 */
export const handleSW =
  (resolveDistPath: (path: string) => string) =>
  async (_request: FastifyRequest, reply: FastifyReply) =>
    reply
      .header('cache-control', 'no-cache, no-store, must-revalidate')
      .type('application/javascript')
      .sendFile('sw.js', resolveDistPath('client'))

/**
 * Handle favicon requests
 */
export const handleFavicon =
  (resolveDistPath: (path: string) => string) =>
  async (_request: FastifyRequest, reply: FastifyReply) =>
    reply.sendFile('favicon.ico', resolveDistPath('client'))

/**
 * Handle robots.txt requests
 */
export const handleRobotsTxt =
  (resolveDistPath: (path: string) => string) =>
  async (_request: FastifyRequest, reply: FastifyReply) =>
    reply.type('text/plain').sendFile('robots.txt', resolveDistPath('client'))

/**
 * Handle sitemap.xml requests
 */
export const handleSitemap =
  (resolveDistPath: (path: string) => string) =>
  async (_request: FastifyRequest, reply: FastifyReply) =>
    reply
      .type('application/xml')
      .sendFile('sitemap.xml', resolveDistPath('client'))

/**
 * Handle SSR requests
 */
export const handleSsr =
  (renderConfig: RenderPageConfig) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    // @ts-expect-error - fastify-session typing issue
    const githubUser = request.session.github_user
    const initialState = githubUser ? { user: githubUser } : undefined

    return Effect.runPromise(
      renderPage(request.url, renderConfig, initialState).pipe(
        Effect.map(html => reply.type('text/html').send(html)),
        Effect.catchAll(error => {
          request.log.error(error)
          return Effect.succeed(
            reply.status(500).send('Internal Server Error')
          )
        })
      )
    )
  }
