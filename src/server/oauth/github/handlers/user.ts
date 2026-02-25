/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import type { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Handle user authentication status check
 */
export const handleGetUser = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // @ts-expect-error - fastify-session typing issue
  const user = request.session.github_user
  request.log.info('Auth check - session user:', user)
  return reply
    .status(200)
    .send(user ? { authenticated: true, user } : { authenticated: false })
}

/**
 * Handle user logout
 */
export const handleLogout = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  // @ts-expect-error - fastify-session typing issue
  request.session.github_user = undefined

  request.log.info('User logged out from app session')

  return reply.redirect('/')
}
