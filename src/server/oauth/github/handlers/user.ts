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
  if (!user) {
    request.log.info('User not authenticated - returning 401')
    return reply.status(401).send({ authenticated: false })
  }
  request.log.info('User authenticated - returning user data')
  return reply.send({ authenticated: true, user })
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
