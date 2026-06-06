import type { Context, Hono } from 'hono'
import { logEvent } from '../log/structured'
import { createRepo } from '../subscribers/repo'
import { pickLang } from './accept-language'
import { renderExpiredPage, renderUnsubscribedPage } from './confirmation'
import { verifyAndFlip } from './handler'
import type { UnsubscribeEnv } from './runtime-env'

export type { UnsubscribeEnv } from './runtime-env'

type App = Hono<{ Bindings: UnsubscribeEnv }>

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
}

const runVerify = (c: Context) => {
  const env = c.env as UnsubscribeEnv
  const repo = createRepo({
    db: env.DB,
    now: () => new Date().toISOString(),
  })
  return verifyAndFlip(repo, env.UNSUBSCRIBE_SECRET, c.req.query('t'))
}

const logOutcome = (method: 'GET' | 'POST', kind: string): void => {
  const evt =
    kind === 'invalid' ? 'unsubscribe.rejected' : 'unsubscribe.applied'
  logEvent(evt, { method, kind })
}

const handleGet = async (c: Context): Promise<Response> => {
  const lang = pickLang(c.req.header('Accept-Language'))
  const outcome = await runVerify(c)
  logOutcome('GET', outcome.kind)
  return outcome.kind === 'invalid'
    ? new Response(renderExpiredPage(lang), {
        status: 404,
        headers: HTML_HEADERS,
      })
    : new Response(renderUnsubscribedPage(lang), {
        status: 200,
        headers: HTML_HEADERS,
      })
}

const handlePost = async (c: Context): Promise<Response> => {
  const outcome = await runVerify(c)
  logOutcome('POST', outcome.kind)
  return outcome.kind === 'invalid' ? c.body(null, 404) : c.body(null, 200)
}

/**
 * Mount the public unsubscribe surface: GET renders an HTML
 * confirmation in the visitor's preferred language, POST honours
 * the RFC-8058 one-click contract with a 200 empty body.
 * @param app Hono app instance (no CF Access middleware on this prefix).
 * @returns The same app for chaining.
 */
export const mountUnsubscribeRoutes = (app: App): App => {
  app.get('/unsubscribe', handleGet)
  app.post('/unsubscribe', handlePost)
  return app
}
