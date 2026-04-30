import type { Context, Hono } from 'hono'
import { exchangeCodeForToken, fetchUserLogin } from './gh-user'
import { signJwt } from './jwt'

/** Bindings the exchange handler reads from the worker env. */
export type ExchangeBindings = {
  readonly JWT_SECRET: string
  readonly GH_CLIENT_ID: string
  readonly GH_CLIENT_SECRET: string
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const codeFrom = (body: unknown): string | undefined => {
  const code = isObject(body) ? body['code'] : undefined
  return typeof code === 'string' ? code : undefined
}

const handle = async (
  c: Context<{ Bindings: ExchangeBindings }>
): Promise<Response> => {
  const body: unknown = await c.req.json().catch(() => undefined)
  const code = codeFrom(body)
  return code === undefined
    ? c.json({ error: 'code required' }, 400)
    : runExchange(c, code)
}

const runExchange = async (
  c: Context<{ Bindings: ExchangeBindings }>,
  code: string
): Promise<Response> => {
  const token = await exchangeCodeForToken(
    code,
    c.env.GH_CLIENT_ID,
    c.env.GH_CLIENT_SECRET
  )
  const login = await fetchUserLogin(token)
  const jwt = await signJwt(login, c.env.JWT_SECRET)
  return c.json({ token: jwt, login })
}

/**
 * Wire the `POST /auth/exchange` route. Accepts `{ code }`,
 * exchanges with GitHub, fetches the login, and returns a signed
 * collector JWT.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerExchangeRoute = (
  app: Hono<{ Bindings: ExchangeBindings }>
): Hono<{ Bindings: ExchangeBindings }> => {
  app.post('/auth/exchange', handle)
  return app
}
