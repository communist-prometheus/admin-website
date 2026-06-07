import type { Context, Hono } from 'hono'
import type { WorkerCtx } from './bindings'
import { fetchUserLogin, isOrgOwner } from './gh-user'
import { mintSessionResponse } from './session-mint'

const BEARER = 'Bearer '

const readBearerToken = (header: string | undefined): string | undefined =>
  header?.startsWith(BEARER) ? header.slice(BEARER.length) : undefined

const checkOwner = async (
  c: Context<WorkerCtx>,
  ghToken: string
): Promise<Response | { login: string }> => {
  const login = await fetchUserLogin(ghToken)
  if (login === undefined) {
    return c.json({ error: 'github token rejected' }, 401)
  }
  const owner = await isOrgOwner({
    org: c.env.GITHUB_ORG,
    login,
    token: ghToken,
  })
  return owner ? { login } : c.json({ error: 'not an org owner' }, 403)
}

/**
 * `POST /auth/session` — exchanges a GitHub OAuth token for a
 * parent-domain SSO cookie. Failure modes map to 401 (missing /
 * rejected GH token) and 403 (login is not an active org owner).
 * @param c Hono context with worker bindings.
 * @returns JSON `{login,roles,expires}` + `Set-Cookie` on success.
 */
const handleSession = async (c: Context<WorkerCtx>): Promise<Response> => {
  const ghToken = readBearerToken(c.req.header('authorization'))
  if (ghToken === undefined) {
    return c.json({ error: 'authorization header required' }, 401)
  }
  const checked = await checkOwner(c, ghToken)
  return 'login' in checked ? mintSessionResponse(c, checked.login) : checked
}

/**
 * Wire `POST /auth/session` — the only public entry point that
 * accepts a raw GH token; every other call goes through the cookie.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSessionRoute = (
  app: Hono<WorkerCtx>
): Hono<WorkerCtx> => {
  app.post('/auth/session', handleSession)
  return app
}
