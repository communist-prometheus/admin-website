import { Effect } from 'effect'
import type Fastify from 'fastify'
import type { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Adds security headers to all responses.
 * @param fastify - Fastify instance
 * @returns Effect containing the configured instance
 */
export const addSecurityHeaders = (fastify: ReturnType<typeof Fastify>) =>
  Effect.sync(() => {
    fastify.addHook(
      'onRequest',
      async (_request: FastifyRequest, reply: FastifyReply) => {
        reply.header('X-Content-Type-Options', 'nosniff')
        reply.header('X-Frame-Options', 'DENY')
        reply.header('X-XSS-Protection', '1; mode=block')
        reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
        reply.header(
          'Permissions-Policy',
          'geolocation=(), microphone=(), camera=()'
        )
        reply.header(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        )
      }
    )
    return fastify
  })
