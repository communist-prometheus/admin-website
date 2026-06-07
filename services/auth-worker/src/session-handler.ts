import type { Context, Hono } from 'hono'
import type { WorkerCtx } from './bindings'
import { buildSessionCookie } from './cookie'
import { fetchUserLogin, isActiveTeamMember } from './gh-user'
import { signSessionJwt } from './jwt/sign'
import { JWT_TTL_SECONDS } from './jwt/types'

const BEARER = 'Bearer '

const readBearerToken = (header: string | undefined): string | undefined =>
  header !== undefined && header.startsWith(BEARER)
    ? header.slice(BEARER.length)
    : undefined

/**
 * Mint a session cookie for a verified GitHub admin.
 *
 * Flow:
 *   1. Read `Authorization: Bearer <gh_token>`.
 *   2. Resolve the GH login from the token.
 *   3. Verify the login is an active member of the configured admin
 *      team.
 *   4. Sign an HS256 session JWT and ship it back both in the
 *      response body (so the SPA can read `{login, teams, expires}`
 *      for UI) and as an HttpOnly cookie scoped to `.comprom.org`.
 *
 * Failure modes:
 *   - missing/empty bearer → 401
 *   - GH refuses the token → 401
 *   - login is not an active member of the admin team → 403
 * @param c Hono context with worker bindings.
 * @returns JSON response with the session payload, plus Set-Cookie.
 */
const handleSession = async (
  c: Context<WorkerCtx>
): Promise<Response> => {
  const ghToken = readBearerToken(c.req.header('authorization'))
  if (ghToken === undefined) {
    return c.json({ error: 'authorization header required' }, 401)
  }
  const login = await fetchUserLogin(ghToken)
  if (login === undefined) {
    return c.json({ error: 'github token rejected' }, 401)
  }
  const active = await isActiveTeamMember({
    org: c.env.GITHUB_ORG,
    team: c.env.GITHUB_ADMIN_TEAM,
    login,
    token: ghToken,
  })
  if (!active) {
    return c.json({ error: 'not a member of admin team' }, 403)
  }
  const teams = [c.env.GITHUB_ADMIN_TEAM]
  const jwt = await signSessionJwt({
    login,
    teams,
    secret: c.env.JWT_SECRET,
  })
  const cookie = buildSessionCookie(jwt, {
    domain: c.env.COOKIE_DOMAIN,
    maxAgeSeconds: JWT_TTL_SECONDS,
  })
  const now = Math.floor(Date.now() / 1000)
  return c.json(
    {
      login,
      teams,
      expires: now + JWT_TTL_SECONDS,
    },
    200,
    { 'Set-Cookie': cookie }
  )
}

/**
 * Wire `POST /auth/session`. The route is the only public entry
 * point that takes a raw GH token — every other call goes through
 * the cookie.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSessionRoute = (
  app: Hono<WorkerCtx>
): Hono<WorkerCtx> => {
  app.post('/auth/session', handleSession)
  return app
}
