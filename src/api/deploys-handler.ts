import type { Context } from 'hono'
import type { Env } from './app'
import { fetchCfDeployments } from './deploys/fetch-cf'

/**
 * List recent CF Workers deployments.
 * GET /api/deploys — returns CF deployment data
 * @param c - Hono context with CF bindings
 * @returns Array of CF deploy entries
 */
export const deploysHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID } = c.env
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID)
    return c.json({ error: 'CF credentials not set' }, 500)

  const deploys = await fetchCfDeployments(
    CF_API_TOKEN,
    CF_ACCOUNT_ID,
    'admin-website'
  )
  return c.json(deploys)
}
