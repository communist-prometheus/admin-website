import type { Context, Hono } from 'hono'
import { logEvent } from '../log/structured'
import { pickLang } from './accept-language'
import {
  renderConfirmPage,
  renderExpiredPage,
  renderUnsubscribedPage,
} from './confirmation'
import { verifyAndFlip, verifyLookup } from './handler'
import { html, repoOf } from './route-helpers'
import type { UnsubscribeEnv } from './runtime-env'

export type { UnsubscribeEnv } from './runtime-env'

type App = Hono<{ Bindings: UnsubscribeEnv }>

/*
 * GET is side-effect free: it only verifies the token and renders
 * either the confirm form (valid), the already-done page, or the
 * expired page. Mail-client prefetchers and AV link scanners follow
 * GETs — flipping state here silently unsubscribed recipients.
 */
const handleGet = async (c: Context): Promise<Response> => {
  const lang = pickLang(c.req.header('Accept-Language'))
  const { repo, secret } = repoOf(c)
  const token = c.req.query('t')
  const outcome = await verifyLookup(repo, secret, token)
  logEvent('unsubscribe.viewed', { method: 'GET', kind: outcome.kind })
  if (outcome.kind === 'invalid') return html(renderExpiredPage(lang), 404)
  return outcome.kind === 'already'
    ? html(renderUnsubscribedPage(lang), 200)
    : html(renderConfirmPage(lang, token ?? ''), 200)
}

const handlePost = async (c: Context): Promise<Response> => {
  const { repo, secret } = repoOf(c)
  const outcome = await verifyAndFlip(repo, secret, c.req.query('t'))
  const evt =
    outcome.kind === 'invalid'
      ? 'unsubscribe.rejected'
      : 'unsubscribe.applied'
  logEvent(evt, { method: 'POST', kind: outcome.kind })
  return outcome.kind === 'invalid' ? c.body(null, 404) : c.body(null, 200)
}

/**
 * Mount the public unsubscribe surface: GET verifies and renders a
 * confirm form (no mutation), POST performs the flip — both the
 * RFC-8058 one-click contract and the form submit land here.
 * @param app Hono app instance (no session middleware on this prefix).
 * @returns The same app for chaining.
 */
export const mountUnsubscribeRoutes = (app: App): App => {
  app.get('/unsubscribe', handleGet)
  app.post('/unsubscribe', handlePost)
  return app
}
