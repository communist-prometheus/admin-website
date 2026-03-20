import { Hono } from 'hono'
import { tokenHandler } from './token-handler'

/**
 * Env bindings available in CF Pages and Vite dev.
 */
export interface Env {
  readonly GITHUB_CLIENT_SECRET: string
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Pages and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
