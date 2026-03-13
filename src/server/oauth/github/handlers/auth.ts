/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import type { FastifyReply, FastifyRequest } from 'fastify'
import { generateCallbackHtml } from './callback-html'

const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
}

/**
 * Resolve token for mock OAuth.
 * Uses real GitHub token when available (dev:token mode),
 * falls back to 'mock-token' for E2E tests.
 */
const getMockToken = (): string =>
  process.env.GITHUB_TOKEN || process.env.GITHUB_E2E_KEY || 'mock-token'

const handleMockAuth = (request: FastifyRequest, reply: FastifyReply) => {
  const token = getMockToken()
  request.log.info(
    `🧪 Mock OAuth: token=${token === 'mock-token' ? 'mock' : 'real'}`
  )
  // @ts-expect-error - fastify-session typing issue
  request.session.github_user = {
    username: mockUser.login,
    name: mockUser.name,
    avatar: mockUser.avatar_url,
    accessToken: token,
  }
  return reply.type('text/html').send(generateCallbackHtml(mockUser))
}

/**
 * Handle GitHub OAuth initiation
 */
export const handleAuth = (
  request: FastifyRequest,
  reply: FastifyReply,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) => {
  if (config.isMockMode) {
    return handleMockAuth(request, reply)
  }

  if (!config.clientId) {
    return reply
      .status(500)
      .send({ error: 'GitHub client ID not configured' })
  }
  if (!config.callbackUrl) {
    return reply
      .status(500)
      .send({ error: 'GitHub callback URL not configured' })
  }

  const scopes = encodeURIComponent('repo read:user')
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.callbackUrl)}&scope=${scopes}`
  return reply.redirect(githubAuthUrl)
}
