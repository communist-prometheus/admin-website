const TOKEN_URL = 'https://github.com/login/oauth/access_token'

interface Env {
  readonly GITHUB_CLIENT_SECRET: string
}

/**
 * CF Pages Function: proxy token exchange to GitHub.
 * Injects GITHUB_CLIENT_SECRET from env vars.
 * @param context - Pages function context
 * @returns Token exchange response
 */
export const onRequestPost: PagesFunction<Env> = async context => {
  const body = new URLSearchParams(await context.request.text())
  body.set('client_secret', context.env.GITHUB_CLIENT_SECRET)

  const gh = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: body.toString(),
  })

  return new Response(await gh.text(), {
    status: gh.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
