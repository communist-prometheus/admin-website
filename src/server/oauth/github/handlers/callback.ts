/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { executeCallbackFlow } from './callback-flow'

/**
 * Handle GitHub OAuth callback
 */
export const handleCallback = (
  request: FastifyRequest,
  reply: FastifyReply,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) => {
  const { code } = request.query as { code?: string }

  if (!code) {
    return reply.status(400).send({ error: 'No code provided' })
  }

  return Effect.runPromise(executeCallbackFlow(request, reply, code, config))
}
