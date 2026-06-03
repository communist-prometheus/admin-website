import type { MiddlewareHandler } from 'hono'
import type { AccessClaims } from '../auth/cf-access'
import { verifyAccessJwt } from '../auth/cf-access'

/** Bindings the middleware reads from the worker env. */
export type RequireAccessEnv = {
  readonly CF_ACCESS_AUD: string
  readonly CF_ACCESS_TEAM: string
}

/** Variables the middleware writes onto the Hono context. */
export type RequireAccessVariables = {
  readonly access: AccessClaims
}

type Options = {
  readonly verifier?: (token: string) => Promise<AccessClaims | undefined>
}

const ACCESS_HEADER = 'Cf-Access-Jwt-Assertion'

/**
 * Hono middleware enforcing a valid CF Access JWT on every wrapped
 * route. On success attaches the decoded claims to `c.var.access`.
 * @param opts Optional verifier override for tests.
 * @returns Hono middleware handler.
 */
export const requireAccess =
  (
    opts: Options = {}
  ): MiddlewareHandler<{
    Bindings: RequireAccessEnv
    Variables: RequireAccessVariables
  }> =>
  async (c, next) => {
    const token = c.req.header(ACCESS_HEADER)
    if (token === undefined || token === '') {
      return c.json({ error: 'unauthorized' }, 401)
    }
    const claims = await (opts.verifier ?? defaultVerifier(c.env))(token)
    if (claims === undefined) return c.json({ error: 'unauthorized' }, 401)
    c.set('access', claims)
    await next()
  }

const defaultVerifier =
  (env: RequireAccessEnv) =>
  (token: string): Promise<AccessClaims | undefined> =>
    verifyAccessJwt(token, {
      aud: env.CF_ACCESS_AUD,
      team: env.CF_ACCESS_TEAM,
    })
