import type { MiddlewareHandler } from 'hono'
import { readSessionCookie } from '../auth/session-cookie'
import type { SessionClaims } from '../auth/session-types'
import { verifySessionJwt } from '../auth/session-verify'

/** Bindings the middleware reads from the worker env. */
export type RequireSessionEnv = {
  readonly JWT_SECRET: string
  readonly REQUIRED_TEAM: string
}

/** Variables the middleware writes onto the Hono context. */
export type RequireSessionVariables = { readonly session: SessionClaims }

/** Verifier signature accepted by both production and test wirings. */
export type SessionVerifier = (
  token: string
) => Promise<SessionClaims | undefined>

type Options = { readonly verifier?: SessionVerifier }

const defaultVerifier =
  (env: RequireSessionEnv) =>
  (token: string): Promise<SessionClaims | undefined> =>
    verifySessionJwt(token, { secret: env.JWT_SECRET })

/**
 * Hono middleware enforcing a valid SSO session cookie on every
 * wrapped route. The token comes from the `comprom_session` cookie
 * set by auth-worker; team gating is by membership in the configured
 * `REQUIRED_TEAM`. Failures return 401 (missing/invalid token) or
 * 403 (valid token but team missing). On success the decoded claims
 * are attached to `c.var.session`.
 * @param opts Optional verifier override for tests.
 * @returns Hono middleware.
 */
export const requireSession =
  (
    opts: Options = {}
  ): MiddlewareHandler<{
    Bindings: RequireSessionEnv
    Variables: RequireSessionVariables
  }> =>
  async (c, next) => {
    const cookie = c.req.header('cookie')
    const token = readSessionCookie(cookie)
    if (token === undefined) {
      return c.json({ error: 'unauthorized' }, 401)
    }
    const verify = opts.verifier ?? defaultVerifier(c.env)
    const claims = await verify(token)
    if (claims === undefined) {
      return c.json({ error: 'unauthorized' }, 401)
    }
    if (!claims.teams.includes(c.env.REQUIRED_TEAM)) {
      return c.json({ error: 'forbidden' }, 403)
    }
    c.set('session', claims)
    await next()
  }
