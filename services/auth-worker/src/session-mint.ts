import type { Context } from 'hono'
import type { WorkerCtx } from './bindings'
import { buildSessionCookie } from './cookie'
import { signSessionJwt } from './jwt/sign'
import { JWT_TTL_SECONDS, ROLE_OWNER } from './jwt/types'

/**
 * Sign a session JWT for `login`, wrap it in a parent-domain cookie,
 * and return the JSON response the SPA needs to render UI. Every
 * issued session is owner-tier today; future tiers add entries to
 * `roles` without changing the shape.
 * @param c Hono context with worker bindings.
 * @param login Verified GitHub login (subject of the JWT).
 * @returns 200 JSON response with `Set-Cookie: comprom_session=…`.
 */
export const mintSessionResponse = async (
  c: Context<WorkerCtx>,
  login: string
): Promise<Response> => {
  const roles = [ROLE_OWNER]
  const jwt = await signSessionJwt({
    login,
    roles,
    secret: c.env.JWT_SECRET,
  })
  const cookie = buildSessionCookie(jwt, {
    domain: c.env.COOKIE_DOMAIN,
    maxAgeSeconds: JWT_TTL_SECONDS,
  })
  const expires = Math.floor(Date.now() / 1000) + JWT_TTL_SECONDS
  return c.json({ login, roles, expires }, 200, { 'Set-Cookie': cookie })
}
