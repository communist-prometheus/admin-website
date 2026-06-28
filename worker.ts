import type { Env } from './src/api/app'
import { api } from './src/api/app'

interface WorkerEnv extends Env {
  readonly ASSETS: {
    readonly fetch: (request: Request) => Promise<Response>
  }
}

/**
 * Cloudflare Worker entrypoint.
 * Routes /api/* to Hono, everything else to static assets.
 */
export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return api.fetch(request, env)
    }

    const res = await env.ASSETS.fetch(request)
    // The service worker MUST never be cached by the browser or the CF
    // edge: a stale /sw.js pins users on an old SW after a deploy (the
    // June incident — the fix shipped but users kept the broken worker).
    if (url.pathname === '/sw.js') {
      const patched = new Response(res.body, res)
      patched.headers.set('Cache-Control', 'no-store')
      return patched
    }
    return res
  },
}
