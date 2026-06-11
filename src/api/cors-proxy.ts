import type { Context } from 'hono'
import { isAllowedOrigin, isAllowedTarget } from './cors-allow'

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

const addCors = (res: Response, origin: string): Response => {
  const out = new Response(res.body, res)
  out.headers.set('Access-Control-Allow-Origin', origin)
  for (const [k, v] of Object.entries(CORS_HEADERS)) out.headers.set(k, v)
  return out
}

const forbidden = (reason: string): Response =>
  new Response(reason, { status: 403 })

const forward = async (c: Context, path: string): Promise<Response> => {
  const url = new URL(c.req.url)
  const target = `https://${path}${url.search}`
  const headers = new Headers(c.req.raw.headers)
  headers.delete('host')
  // The proxy must never relay the admin session cookie to GitHub.
  headers.delete('cookie')
  const body =
    c.req.method === 'GET' || c.req.method === 'HEAD'
      ? undefined
      : await c.req.arrayBuffer()
  return fetch(target, { method: c.req.method, headers, body })
}

/**
 * CORS proxy for isomorphic-git push/pull to GitHub. Locked down to
 * the admin app origins and to github.com git smart-HTTP paths —
 * see cors-allow.ts for why both gates exist.
 * @param c - Hono context
 * @returns Proxied response with CORS headers
 */
export const corsProxy = async (c: Context): Promise<Response> => {
  const origin = c.req.header('Origin')
  if (origin !== undefined && !isAllowedOrigin(origin))
    return forbidden('Origin not allowed')
  if (c.req.method === 'OPTIONS')
    return addCors(new Response(undefined, { status: 204 }), origin ?? '*')
  const path = c.req.path.replace('/api/cors/', '')
  if (!isAllowedTarget(path)) return forbidden('Target not allowed')
  const resp = await forward(c, path)
  return origin === undefined ? resp : addCors(resp, origin)
}
