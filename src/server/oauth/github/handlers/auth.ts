/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import type { FastifyReply, FastifyRequest } from 'fastify'
import { generateCallbackHtml } from './callback-html'

const mockUser = {
  login: 'test-user',
  name: 'Test User',
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
}

const handleMockAuth = (request: FastifyRequest, reply: FastifyReply) => {
  request.log.info('🧪 Mock OAuth: Sending mock user via postMessage')
  // @ts-expect-error - fastify-session typing issue
  request.session.github_user = {
    username: mockUser.login,
    name: mockUser.name,
    avatar: mockUser.avatar_url,
    accessToken: process.env.GITHUB_TOKEN || process.env.GITHUB_E2E_KEY || '',
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
