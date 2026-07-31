import type { Context } from 'hono'
import type { Env } from './app'
import {
  asScalarString,
  FORWARDED,
  pickFields,
  RETURNED,
  toRecord,
} from './token-fields'

const TOKEN_URL = 'https://github.com/login/oauth/access_token'

const json = (payload: unknown, status: number): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

/**
 * A request is a valid grant when it carries either an authorization
 * `code` (PKCE exchange) or a `refresh_token` under
 * `grant_type=refresh_token` (renewal). Anything else is rejected
 * before contacting GitHub.
 * @param p - Inbound form parameters
 * @returns True when the grant is exchangeable
 */
const isExchangeableGrant = (p: URLSearchParams): boolean =>
  !!p.get('code') ||
  (p.get('grant_type') === 'refresh_token' && !!p.get('refresh_token'))

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
  const expected = c.env.GITHUB_CLIENT_ID
  // Fail closed: a deploy missing either secret cannot relay arbitrary
  // client ids to GitHub with our credentials.
  if (!secret || !expected) return json({ error: 'server_config' }, 500)
  const inbound = new URLSearchParams(await c.req.text())
  if (inbound.get('client_id') !== expected)
    return json({ error: 'invalid_client' }, 400)
  if (!isExchangeableGrant(inbound))
    return json({ error: 'invalid_request' }, 400)
  const body = new URLSearchParams({
    ...pickFields(k => inbound.get(k) ?? undefined, FORWARDED),
    client_id: expected,
    client_secret: secret,
  })
  const gh = await exchange(body)
  const record = toRecord(await gh.json().catch(() => ({})))
  const safe = pickFields(k => asScalarString(record[k]), RETURNED)
  return json(safe, gh.status)
}
