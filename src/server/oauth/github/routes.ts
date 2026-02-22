/* eslint-disable jsdoc/require-jsdoc, jsdoc/require-param */
import type { FastifyInstance } from 'fastify'
import { handleAuth } from './handlers/auth'
import { handleCallback } from './handlers/callback'
import { handleGetUser, handleLogout } from './handlers/user'

export interface GitHubOAuthConfig {
  clientId?: string
  clientSecret?: string
  callbackUrl?: string
  isMockMode: boolean
}

const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
}

/**
 * Register GitHub OAuth routes
 */
export const registerGitHubOAuthRoutes = (
  fastify: FastifyInstance,
  config: GitHubOAuthConfig
): void => {
  if (config.isMockMode) {
    fastify.get('/api/test/status', async (_request, reply) => {
      return reply.send({
        mockOAuth: true,
        mockUser,
        message: 'Mock OAuth mode is active',
      })
    })
  }

  fastify.get('/api/auth/github', async (request, reply) => {
    return handleAuth(request, reply, config)
  })

  fastify.get('/auth/github/callback', async (request, reply) => {
    return handleCallback(request, reply, config)
  })

  fastify.get('/api/auth/user', async (request, reply) => {
    return handleGetUser(request, reply)
  })

  fastify.get('/api/auth/logout', async (request, reply) => {
    return handleLogout(request, reply)
  })
}
