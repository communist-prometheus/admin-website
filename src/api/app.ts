import { Hono } from 'hono'
import { appTokenHandler } from './app-token-handler'
import { corsProxy } from './cors-proxy'
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
  readonly GH_APP_PRIVATE_KEY: string
  readonly GH_APP_ID: string
  readonly GH_INSTALLATION_ID: string
  readonly ADMIN_PASSWORD: string
}

/**
 * Shared Hono app for API routes.
 * basePath /api — matches both CF Pages and Vite dev.
 */
export const api = new Hono<{ Bindings: Env }>()
  .basePath('/api')
  .post('/oauth/token', tokenHandler)
  .post('/auth/app-token', appTokenHandler)
  .get('/deploy', deployHandler)
  .get('/deploys', deploysHandler)
  .all('/cors/*', corsProxy)
