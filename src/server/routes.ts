import { Effect } from 'effect'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { User } from '@/types/user'

/**
 * Sets up SSR catch-all route with user session state.
 * @param fastify - Fastify instance
 * @param renderPage - Function to render Vue SSR page with optional initial state
 * @returns Effect that registers the route
 */
export const setupRoutes = (
  fastify: FastifyInstance,
  renderPage: (
    url: string,
    initialState?: { user?: User }
  ) => Promise<{ html: string; modules: Set<string> }>
) =>
  Effect.sync(() => {
    fastify.get('*', async (request: FastifyRequest, reply: FastifyReply) => {
      const githubUser = (
        request.session as unknown as { github_user?: User }
      ).github_user
      const { html } = await renderPage(
        request.url,
        githubUser ? { user: githubUser } : undefined
      )
      reply.type('text/html').send(html)
    })
  })
