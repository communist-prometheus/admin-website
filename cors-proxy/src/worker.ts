/**
 * CORS proxy for isomorphic-git.
 * Proxies requests to github.com with CORS headers.
 * Deploy: cd cors-proxy && npx wrangler deploy
 */

interface Env {
  readonly ALLOWED_ORIGINS: string
}

const GITHUB_HOST = 'github.com'

/**
 * Check if the request origin is allowed.
 * @param origin - Request origin header
 * @param allowed - Comma-separated allowed origins
 * @returns The origin if allowed, undefined otherwise
 */
const checkOrigin = (
  origin: string | null,
  allowed: string
): string | undefined => {
  if (!origin) return undefined
  const list = allowed.split(',').map(s => s.trim())
  return list.includes(origin) ? origin : undefined
}

/**
 * Build CORS headers for the response.
 * @param origin - Allowed origin to reflect
 * @returns Headers object with CORS headers
 */
const corsHeaders = (
  origin: string
): Record<string, string> => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods':
    'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
})

/**
 * Handle preflight OPTIONS request.
 * @param origin - Validated origin
 * @returns 204 response with CORS headers
 */
const handlePreflight = (origin: string): Response =>
  new Response(null, {
    status: 204,
    headers: corsHeaders(origin),
  })

/**
 * Proxy the request to GitHub and add CORS headers.
 * @param request - Incoming request
 * @param origin - Validated origin
 * @returns Proxied response with CORS headers
 */
const proxyToGitHub = async (
  request: Request,
  origin: string
): Promise<Response> => {
  const url = new URL(request.url)
  const target = `https://${GITHUB_HOST}${url.pathname}`

  const headers = new Headers(request.headers)
  headers.delete('host')

  const resp = await fetch(target, {
    method: request.method,
    headers,
    body: request.body,
  })

  const out = new Response(resp.body, resp)
  for (const [k, v] of Object.entries(corsHeaders(origin))) {
    out.headers.set(k, v)
  }
  return out
}

export default {
  async fetch(
    request: Request,
    env: Env
  ): Promise<Response> {
    const origin = checkOrigin(
      request.headers.get('Origin'),
      env.ALLOWED_ORIGINS
    )
    if (!origin) {
      return new Response('Forbidden', { status: 403 })
    }

    if (request.method === 'OPTIONS') {
      return handlePreflight(origin)
    }

    return proxyToGitHub(request, origin)
  },
}
