import type { Context } from 'hono'
import type { Env } from './app'

const CF_API = 'https://api.cloudflare.com/client/v4'

interface CfDeployment {
  deployment_trigger?: {
    metadata?: { commit_hash?: string }
  }
}

interface CfResponse {
  result?: CfDeployment[]
}

/**
 * Proxy CF Pages deployment status for a commit SHA.
 * GET /api/deploy?sha=abc123
 * @param c - Hono context with CF bindings
 * @returns Latest deployment matching the SHA
 */
export const deployHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_PROJECT_NAME } = c.env
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_PROJECT_NAME)
    return c.json({ error: 'CF credentials not set' }, 500)

  const sha = c.req.query('sha')
  if (!sha) return c.json({ error: 'sha required' }, 400)

  const url = `${CF_API}/accounts/${CF_ACCOUNT_ID}/pages/projects/${CF_PROJECT_NAME}/deployments`
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  })
  if (!r.ok) return new Response(r.body, { status: r.status })

  const data: CfResponse = await r.json()
  const match = (data.result ?? []).find(d =>
    d.deployment_trigger?.metadata?.commit_hash?.startsWith(sha)
  )
  if (!match) return c.json({ status: 'not_found' }, 404)
  return c.json(match)
}
