import type { MiddlewareHandler } from 'hono'

export type CorsEnv = { readonly ALLOWED_ORIGIN: string }

const ALLOW_HEADERS = 'Authorization, Content-Type'
const ALLOW_METHODS = 'GET, POST, PUT, DELETE, OPTIONS'

/**
 * Hono middleware that mirrors the request origin only when it
 * matches the worker's `ALLOWED_ORIGIN` env. Sets
 * `Access-Control-Allow-Credentials: true` so the parent-domain
 * `comprom_session` cookie rides on cross-origin XHRs from
 * `admin.comprom.org`. Preflight short-circuits to 204.
 * @returns Hono middleware handler.
 */
export const cors =
  (): MiddlewareHandler<{ Bindings: CorsEnv }> =>
  async (c, next) => {
    const origin = c.req.header('origin')
    const allow = origin === c.env.ALLOWED_ORIGIN ? origin : undefined
    const setHeaders = (res: Response): Response => {
      if (allow !== undefined) {
        res.headers.set('Access-Control-Allow-Origin', allow)
        res.headers.set('Access-Control-Allow-Credentials', 'true')
        res.headers.set('Access-Control-Allow-Headers', ALLOW_HEADERS)
        res.headers.set('Access-Control-Allow-Methods', ALLOW_METHODS)
        res.headers.set('Vary', 'Origin')
      }
      return res
    }
    if (c.req.method === 'OPTIONS') {
      return setHeaders(new Response(null, { status: 204 }))
    }
    await next()
    if (c.res !== undefined) {
      c.res = setHeaders(c.res)
    }
  }
