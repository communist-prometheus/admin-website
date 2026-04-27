import { Hono } from 'hono'
import { corsProxy } from './cors-proxy'
import { tokenHandler } from './token-handler'

/**
 * Env bindings available on CF Workers and in Vite dev.
 */
export interface Env {
  readonly GITHUB_CLIENT_SECRET: string
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Workers and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
  .all('/cors/*', corsProxy)
