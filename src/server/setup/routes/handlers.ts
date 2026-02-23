/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { type RenderPageConfig, renderPage } from '../../ssr/page-renderer'

/**
 * Handle favicon requests
 */
export const handleFavicon =
  (resolveDistPath: (path: string) => string) =>
  async (_request: FastifyRequest, reply: FastifyReply) =>
    reply.sendFile('favicon.ico', resolveDistPath('client'))

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
