import { handle } from 'hono/cloudflare-pages'
import { api } from '../src/api/app'

/**
 * CF Pages catch-all: delegates all requests to Hono.
 * Only /api/* routes are defined; others return 404.
 */
export const onRequest = handle(api)
