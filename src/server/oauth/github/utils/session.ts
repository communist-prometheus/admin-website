/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect } from 'effect'
import type { FastifyRequest } from 'fastify'

/**
 * Save session
 */
export const saveSession = (request: FastifyRequest) =>
  Effect.async<void, Error>(resume => {
    request.session.save((err: Error | null) => {
      if (err) resume(Effect.fail(err))
      else resume(Effect.succeed(undefined))
    })
  })
