import type { Context } from 'hono'
import type { Env } from './app'

const TOKEN_URL = 'https://github.com/login/oauth/access_token'

/**
 * Exchange OAuth code for access token via GitHub.
 * Injects GITHUB_CLIENT_SECRET from env bindings.
 * @param c - Hono context
 * @returns JSON response with token or error
 */
export const tokenHandler = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const secret = c.env.GITHUB_CLIENT_SECRET
  if (!secret) {
    return c.json(
      {
        error: 'server_config',
        error_description:
          'GITHUB_CLIENT_SECRET not configured',
      },
      500
    )
  }

  const body = new URLSearchParams(await c.req.text())
  body.set('client_secret', secret)

  const gh = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  return c.json(await gh.json(), gh.status as 200)
}
