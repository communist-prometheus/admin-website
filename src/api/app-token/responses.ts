import type { Context } from 'hono'
import type { Env } from '../app'

/**
 * Response for a missing or incomplete worker configuration.
 * @param c - Hono context
 * @returns JSON 500 with a server_config error
 */
export const missingConfigResponse = (
  c: Context<{ Bindings: Env }>
): Response =>
  c.json(
    {
      error: 'server_config',
      error_description:
        'Missing ADMIN_PASSWORD, GH_APP_PRIVATE_KEY, GH_APP_ID, or GH_INSTALLATION_ID on the worker',
    },
    500
  )

/**
 * Response for failed Basic Auth.
 * @param c - Hono context
 * @param description - Human-readable explanation
 * @returns JSON 401 with WWW-Authenticate header
 */
export const unauthorizedResponse = (
  c: Context<{ Bindings: Env }>,
  description: string
): Response =>
  c.json({ error: 'unauthorized', error_description: description }, 401, {
    'WWW-Authenticate': 'Basic realm="admin"',
  })
