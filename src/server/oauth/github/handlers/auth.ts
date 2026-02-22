/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import type { FastifyReply, FastifyRequest } from 'fastify'

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
    request.log.info('🧪 Mock OAuth: Redirecting to callback with mock code')
    const callbackUrl =
      config.callbackUrl || 'http://localhost:3000/auth/github/callback'
    return reply.redirect(`${callbackUrl}?code=mock_code_123`)
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

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(config.callbackUrl)}&scope=read:user`
  return reply.redirect(githubAuthUrl)
}
