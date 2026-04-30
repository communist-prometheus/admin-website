import type { Context, MiddlewareHandler, Next } from 'hono'
import type { JwtPayload } from './jwt-types'
import { verifyJwt } from './jwt-verify'

/** Bindings the auth middleware reads. */
export type AuthBindings = {
  readonly JWT_SECRET: string
}

/** Variables the middleware writes onto the Hono context. */
export type AuthVariables = {
  readonly user: JwtPayload
}

const PUBLIC_PATHS = new Set<string>(['/health', '/auth/exchange'])

const tokenFrom = (header: string | undefined): string | undefined => {
  const prefix = 'Bearer '
  return header !== undefined && header.startsWith(prefix)
    ? header.slice(prefix.length)
    : undefined
}

/**
 * Hono middleware that enforces a valid HS256 JWT on every
 * non-public route. Attaches the decoded payload to the Hono
 * context under `user` so handlers can attribute incoming data.
 * @returns Hono middleware handler.
 */
export const authMiddleware = (): MiddlewareHandler<{
  Bindings: AuthBindings
  Variables: AuthVariables
}> => {
  return async (
    c: Context<{ Bindings: AuthBindings; Variables: AuthVariables }>,
    next: Next
  ): Promise<Response | undefined> => {
    const url = new URL(c.req.url)
    const isPublic = PUBLIC_PATHS.has(url.pathname)
    const token = tokenFrom(c.req.header('authorization'))
    const payload = isPublic
      ? undefined
      : token === undefined
        ? undefined
        : await verifyJwt(token, c.env.JWT_SECRET)
    const reject = !isPublic && payload === undefined
    const setUser = !isPublic && payload !== undefined
    const noop = (): void => undefined
    const apply = setUser ? () => c.set('user', payload) : noop
    apply()
    return reject ? c.json({ error: 'unauthorized' }, 401) : await next()
  }
}
