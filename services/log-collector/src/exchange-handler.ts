import type { Context, Hono } from 'hono'
import { exchangeCodeForToken, fetchUserLogin, isOrgMember } from './gh-user'
import { signJwt } from './jwt'

/** Bindings the exchange handler reads from the worker env. */
export type ExchangeBindings = {
  readonly JWT_SECRET: string
  readonly GH_CLIENT_ID: string
  readonly GH_CLIENT_SECRET: string
  readonly GITHUB_ORG: string
}

type Ctx = Context<{ Bindings: ExchangeBindings }>

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const codeFrom = (body: unknown): string | undefined => {
  const code = isObject(body) ? body['code'] : undefined
  return typeof code === 'string' ? code : undefined
}

const handle = async (c: Ctx): Promise<Response> => {
  const body: unknown = await c.req.json().catch(() => undefined)
  const code = codeFrom(body)
  if (code === undefined) return c.json({ error: 'code required' }, 400)
  // GitHub failures (bad/expired code, API hiccup) must map to a
  // client error, not an unhandled 500 leaking upstream messages.
  return runExchange(c, code).catch(() =>
    c.json({ error: 'oauth_failed' }, 400)
  )
}

const runExchange = async (c: Ctx, code: string): Promise<Response> => {
  const token = await exchangeCodeForToken(
    code,
    c.env.GH_CLIENT_ID,
    c.env.GH_CLIENT_SECRET
  )
  const login = await fetchUserLogin(token)
  // Org gate: a collector JWT is a write credential for the
  // observability store — only active org members may mint one.
  if (!(await isOrgMember(c.env.GITHUB_ORG, login, token)))
    return c.json({ error: 'not an org member' }, 403)
  const jwt = await signJwt(login, c.env.JWT_SECRET)
  return c.json({ token: jwt, login })
}

/**
 * Wire the `POST /auth/exchange` route. Accepts `{ code }`,
 * exchanges with GitHub, verifies org membership, and returns a
 * signed collector JWT.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerExchangeRoute = (
  app: Hono<{ Bindings: ExchangeBindings }>
): Hono<{ Bindings: ExchangeBindings }> => {
  app.post('/auth/exchange', handle)
  return app
}
