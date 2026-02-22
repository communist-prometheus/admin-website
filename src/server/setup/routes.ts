/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type Fastify from 'fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  type GitHubOAuthConfig,
  registerGitHubOAuthRoutes,
} from '../oauth/github/routes'
import { type RenderPageConfig, renderPage } from '../ssr/page-renderer'

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
      fastify.get(
        '/favicon.ico',
        async (_request: FastifyRequest, reply: FastifyReply) => {
          return reply.sendFile('favicon.ico', resolveDistPath('client'))
        }
      )
    }

    fastify.get('*', async (request: FastifyRequest, reply: FastifyReply) => {
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
    })

    return fastify
  })
