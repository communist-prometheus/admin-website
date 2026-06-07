import type { MiddlewareHandler } from 'hono'

export type CorsOptions = {
  readonly allowedOrigin: string
}

const ALLOW_HEADERS = 'Authorization, Content-Type'
const ALLOW_METHODS = 'GET, POST, OPTIONS'

/**
 * CORS middleware that mirrors the origin only when it matches the
 * worker's configured allowlist and always sends
 * `Access-Control-Allow-Credentials: true` for cookie-bearing XHRs.
 * Preflight (`OPTIONS`) short-circuits with 204 — never hits the
 * downstream handler.
 * @param opts Allowed-origin configuration.
 * @returns Hono middleware.
 */
export const cors =
  (opts: CorsOptions): MiddlewareHandler =>
  async (c, next) => {
    const origin = c.req.header('origin')
    const allow = origin === opts.allowedOrigin ? origin : undefined
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
