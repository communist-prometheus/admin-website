import type { FastifyInstance } from 'fastify'
import type { GitHubOAuthConfig } from '../oauth/github'
import { handleGitHubAuth, handleGitHubCallback } from './handlers'
import { clearSessionUser, getSessionUser } from './session'

/**
 * Registers authentication routes for GitHub OAuth flow.
 * @param fastify - Fastify instance
 * @param config - GitHub OAuth configuration
 * @param isProduction - Whether running in production mode
 */
export const registerAuthRoutes = (
  fastify: FastifyInstance,
  config: GitHubOAuthConfig,
  isProduction: boolean
) => {
  fastify.get('/api/auth/github', handleGitHubAuth(config, isProduction))
  fastify.get(
    '/auth/github/callback',
    handleGitHubCallback(config, isProduction)
  )

  fastify.get('/api/auth/user', async (request, reply) => {
    const user = getSessionUser(request)
    return reply
      .status(200)
      .send(user ? { authenticated: true, user } : { authenticated: false })
  })

  fastify.get('/api/auth/logout', async (request, reply) => {
    clearSessionUser(request)
    return reply.redirect('/')
  })
}
