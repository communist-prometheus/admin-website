import { Hono } from 'hono'
import { deployHandler } from './deploy-handler'
import { deploysHandler } from './deploys-handler'
import { tokenHandler } from './token-handler'

/**
 * Env bindings available in CF Pages and Vite dev.
 */
export interface Env {
  readonly GITHUB_CLIENT_SECRET: string
  readonly CF_API_TOKEN: string
  readonly CF_ACCOUNT_ID: string
  readonly CF_PROJECT_NAME: string
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Pages and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
  .get('/deploy', deployHandler)
  .get('/deploys', deploysHandler)
