import type { Context } from 'hono'
import type { Env } from './app'

const CF_API = 'https://api.cloudflare.com/client/v4'

interface CfVersion {
  id: string
  number: number
  metadata: { created_on: string }
}

interface CfVersionsResponse {
  result?: { items?: CfVersion[] }
}

/**
 * Get latest Workers version for the public-website.
 * GET /api/deploy?after=22 — returns latest version > number
 * GET /api/deploy — returns latest version
 * @param c - Hono context with CF bindings
 * @returns Latest version info or 404
 */
export const deployHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const { CF_API_TOKEN, CF_ACCOUNT_ID, CF_PROJECT_NAME } = c.env
  if (!CF_API_TOKEN || !CF_ACCOUNT_ID || !CF_PROJECT_NAME)
    return c.json({ error: 'CF credentials not set' }, 500)

  const url = `${CF_API}/accounts/${CF_ACCOUNT_ID}/workers/scripts/${CF_PROJECT_NAME}/versions`
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${CF_API_TOKEN}` },
  })
  if (!r.ok) return new Response(r.body, { status: r.status })

  const data: CfVersionsResponse = await r.json()
  const items = data.result?.items ?? []
  const after = Number(c.req.query('after') ?? '0')
  const latest = items[0]

  if (!latest) return c.json({ status: 'not-found' }, 404)
  const isNew = latest.number > after
  return c.json({
    version: latest.number,
    createdOn: latest.metadata.created_on,
    isNew,
  })
}
