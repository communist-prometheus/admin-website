/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  getUserData,
  handleMockRedirect,
  storeUserInSession,
} from './callback-helpers'
import { generateCallbackHtml } from './callback-html'

/**
 * Execute OAuth callback flow
 */
export const executeCallbackFlow = (
  request: FastifyRequest,
  reply: FastifyReply,
  code: string,
  config: {
    clientId?: string
    clientSecret?: string
    callbackUrl?: string
    isMockMode: boolean
  }
) =>
  pipe(
    getUserData(code, config),
    Effect.tap(userData => storeUserInSession(request, userData)),
    Effect.flatMap(userData =>
      config.isMockMode
        ? handleMockRedirect(request, reply)
        : Effect.succeed(
            reply.type('text/html').send(generateCallbackHtml(userData))
          )
    ),
    Effect.catchAll(error => {
      request.log.error(error)
      return Effect.succeed(reply.status(500).send({ error: 'OAuth failed' }))
    })
  )
