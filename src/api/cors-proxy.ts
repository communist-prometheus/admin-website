import type { Context } from 'hono'

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

/**
 * CORS proxy for isomorphic-git push/pull to GitHub.
 * Proxies /api/cors/github.com/* → https://github.com/*
 * @param c - Hono context
 * @returns Proxied response with CORS headers
 */
export const corsProxy = async (c: Context): Promise<Response> => {
  const origin = c.req.header('Origin') ?? '*'
  if (c.req.method === 'OPTIONS')
    return addCors(new Response(undefined, { status: 204 }), origin)
  const path = c.req.path.replace('/api/cors/', '')
  const url = new URL(c.req.url)
  const target = url.search
    ? `https://${path}${url.search}`
    : `https://${path}`
  const headers = new Headers(c.req.raw.headers)
  headers.delete('host')
  const resp = await fetch(target, {
    method: c.req.method,
    headers,
    body: c.req.raw.body,
  })
  return addCors(resp, origin)
}
