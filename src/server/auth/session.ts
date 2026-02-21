import { Effect } from 'effect'
import type { FastifyRequest } from 'fastify'
import type { User } from '@/types/user'

/**
 * Saves user data to Fastify session storage.
 * @param request - Fastify request object
 * @param user - User data to save in session
 * @returns Effect that completes when session is saved or fails with error
 */
export const saveSession = (request: FastifyRequest, user: User) =>
  Effect.async<void, Error>(resume => {
    ;(request.session as unknown as { github_user?: User }).github_user = user
    request.session.save((err: Error | null) =>
      err ? resume(Effect.fail(err)) : resume(Effect.succeed(undefined))
    )
  })

/**
 * Retrieves user data from Fastify session.
 * @param request - Fastify request object
 * @returns User from session or undefined if not authenticated
 */
export const getSessionUser = (request: FastifyRequest): User | undefined =>
  (request.session as unknown as { github_user?: User }).github_user

/**
 * Clears user data from Fastify session.
 * @param request - Fastify request object
 */
export const clearSessionUser = (request: FastifyRequest): void => {
  ;(request.session as unknown as { github_user?: User }).github_user =
    undefined
}
