import type { Context } from 'hono'
import type { Env } from './app'
import { fetchCfDeployments } from './deploys/fetch-cf'
import { fetchGhCommits } from './deploys/fetch-gh'
import { mergeDeployData } from './deploys/merge'

/**
 * List recent deployments with git commit info.
 * GET /api/deploys — returns merged CF + GitHub data
 * @param c - Hono context with CF bindings
 * @returns Array of deploy entries
 */
export const deploysHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID } = c.env
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID)
    return c.json({ error: 'CF credentials not set' }, 500)

  const [deploys, commits] = await Promise.all([
    fetchCfDeployments(CF_API_TOKEN, CF_ACCOUNT_ID, 'admin-website'),
    fetchGhCommits(),
  ])

  return c.json(mergeDeployData(deploys, commits))
}
