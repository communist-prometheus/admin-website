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
  async fetch(
    request: Request,
    env: WorkerEnv
  ): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/')) {
      return api.fetch(request, env)
    }

    return env.ASSETS.fetch(request)
  },
}
