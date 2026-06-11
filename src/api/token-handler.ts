import type { Context } from 'hono'
import type { Env } from './app'
import { FORWARDED, pickFields, RETURNED, toRecord } from './token-fields'

const TOKEN_URL = 'https://github.com/login/oauth/access_token'

const json = (payload: unknown, status: number): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const exchange = async (body: URLSearchParams): Promise<Response> =>
  fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

/**
 * Exchange OAuth code for access token via GitHub. Injects
 * GITHUB_CLIENT_SECRET from env bindings; pins client_id to the
 * configured app and forwards/returns only known-safe fields so the
 * endpoint cannot relay arbitrary parameters or response data.
 * @param c - Hono context
 * @returns JSON response with token or error
 */
export const tokenHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const secret = c.env.GITHUB_CLIENT_SECRET
  if (!secret) return json({ error: 'server_config' }, 500)
  const inbound = new URLSearchParams(await c.req.text())
  const expected = c.env.GITHUB_CLIENT_ID
  const clientId = inbound.get('client_id') ?? ''
  if (expected && clientId !== expected)
    return json({ error: 'invalid_client' }, 400)
  if (!inbound.get('code')) return json({ error: 'invalid_request' }, 400)
  const body = new URLSearchParams({
    ...pickFields(k => inbound.get(k) ?? undefined, FORWARDED),
    client_id: clientId,
    client_secret: secret,
  })
  const gh = await exchange(body)
  const record = toRecord(await gh.json().catch(() => ({})))
  const safe = pickFields(k => {
    const v = record[k]
    return typeof v === 'string' ? v : undefined
  }, RETURNED)
  return json(safe, gh.status)
}
