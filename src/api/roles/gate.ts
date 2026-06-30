import type { Context } from 'hono'
import type { Env } from '../app'
import { isAllowedOrigin } from '../cors-allow'

/**
 * Extract the caller's bearer token from the Authorization header.
 * @param c - Hono context.
 * @returns The token, or '' when absent.
 */
export const bearer = (c: Context<{ Bindings: Env }>): string =>
  (c.req.header('Authorization') ?? '').replace(/^Bearer /i, '')

/**
 * Shared pre-checks for every role endpoint: Origin allowlist + bearer
 * present. Returns a 403 Response to short-circuit, else undefined.
 * @param c - Hono context.
 * @returns 403 Response, or undefined when the request may proceed.
 */
export const preflight = (
  c: Context<{ Bindings: Env }>
): Response | undefined => {
  const origin = c.req.header('Origin')
  return (
    (origin !== undefined && !isAllowedOrigin(origin)
      ? new Response('Origin not allowed', { status: 403 })
      : undefined) ??
    (bearer(c) ? undefined : new Response('Missing token', { status: 403 }))
  )
}
