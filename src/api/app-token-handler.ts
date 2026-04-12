import type { Context } from 'hono'
import type { Env } from './app'
import { parseBasicAuth, timingSafeEqual } from './app-token/basic-auth'
import { mintForCreds } from './app-token/mint-for-creds'
import {
  missingConfigResponse,
  unauthorizedResponse,
} from './app-token/responses'
import {
  type ResolvedConfig,
  resolveConfig,
} from './app-token/validate-config'

const authenticate = (
  c: Context<{ Bindings: Env }>,
  config: ResolvedConfig
): Response | undefined => {
  const creds = parseBasicAuth(c.req.header('Authorization'))
  if (!creds) return unauthorizedResponse(c, 'Basic Auth required')
  if (!timingSafeEqual(config.adminPassword, creds.pass)) {
    return unauthorizedResponse(c, 'Invalid credentials')
  }
  return undefined
}

const mintOrError = async (
  c: Context<{ Bindings: Env }>,
  config: ResolvedConfig
): Promise<Response> => {
  try {
    return c.json(await mintForCreds(config))
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return c.json({ error: 'token_mint_failed', error_description: msg }, 500)
  }
}

/**
 * Handle `POST /api/auth/app-token` — mint a GitHub App installation
 * access token after validating the admin password via Basic Auth.
 * Sidesteps the OAuth redirect_uri flow entirely.
 * @param c - Hono context
 * @returns JSON `{ token, expires_at }` or `{ error }`
 */
export const appTokenHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const config = resolveConfig(c.env)
  if (!config) return missingConfigResponse(c)
  const denied = authenticate(c, config)
  if (denied) return denied
  return mintOrError(c, config)
}
