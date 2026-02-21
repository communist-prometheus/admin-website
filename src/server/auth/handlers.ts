import { Effect, pipe } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  authenticateWithGitHub,
  type GitHubOAuthConfig,
} from '../oauth/github'
import { saveSession } from './session'
import { getRequestOrigin, sendPopupHTML } from './utils'

/**
 * Builds OAuth callback URL from config or request origin.
 * @param request - Fastify request object
 * @param config - GitHub OAuth configuration
 * @param isProduction - Whether running in production mode
 * @returns Full callback URL
 */
const buildCallbackUrl = (
  request: FastifyRequest,
  config: GitHubOAuthConfig,
  isProduction: boolean
) =>
  config.callbackUrl ||
  `${getRequestOrigin(request, isProduction)}/auth/github/callback`

/**
 * Creates handler for initiating GitHub OAuth flow.
 * @param config - GitHub OAuth configuration
 * @param isProduction - Whether running in production mode
 * @returns Fastify route handler that redirects to GitHub OAuth
 */
export const handleGitHubAuth =
  (config: GitHubOAuthConfig, isProduction: boolean) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const callbackUrl = buildCallbackUrl(request, config, isProduction)
    if (config.isMockMode)
      return reply.redirect(`${callbackUrl}?code=mock_code_123`)
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=read:user`
    return reply.redirect(githubAuthUrl)
  }

/**
 * Creates handler for GitHub OAuth callback.
 * @param config - GitHub OAuth configuration
 * @param isProduction - Whether running in production mode
 * @returns Fastify route handler that processes OAuth callback
 */
export const handleGitHubCallback =
  (config: GitHubOAuthConfig, isProduction: boolean) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    const { code } = request.query as { code?: string }
    if (!code) return reply.status(400).send({ error: 'No code provided' })

    const callbackUrl = buildCallbackUrl(request, config, isProduction)
    const program = pipe(
      authenticateWithGitHub({ ...config, callbackUrl }, code),
      Effect.flatMap(user =>
        pipe(
          saveSession(request, user),
          Effect.map(() => user)
        )
      )
    )

    return Effect.runPromise(program)
      .then(user =>
        config.isMockMode ? reply.redirect('/') : sendPopupHTML(reply, user)
      )
      .catch(() => reply.status(500).send({ error: 'OAuth failed' }))
  }
