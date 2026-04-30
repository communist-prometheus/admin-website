import type { Context, Hono } from 'hono'
import type { AuthVariables } from './auth-middleware'
import {
  buildRbac,
  canSeeTrace,
  orgsFromSpans,
  type RbacBindings,
} from './rbac-policy'
import type { StorageBindings } from './storage-types'
import { fetchTraceDetail } from './trace-detail-fetch'

/** Bindings the detail handler reads from the env. */
export type DetailBindings = StorageBindings & RbacBindings

const runDetail = async (
  c: Context<{ Bindings: DetailBindings; Variables: AuthVariables }>
): Promise<Response> => {
  const traceId = c.req.param('traceId')
  const detail = await fetchTraceDetail(c.env, traceId)
  const empty = detail.spans.length === 0
  return empty
    ? c.json({ error: 'not found' }, 404)
    : runRbac(c, traceId, detail)
}

const runRbac = (
  c: Context<{ Bindings: DetailBindings; Variables: AuthVariables }>,
  traceId: string,
  detail: Awaited<ReturnType<typeof fetchTraceDetail>>
): Response => {
  const ctx = buildRbac(c.env, c.get('user').sub)
  const allowed = canSeeTrace(ctx, orgsFromSpans(detail.spans))
  return allowed
    ? c.json({ traceId, ...detail })
    : c.json({ error: 'forbidden' }, 403)
}

/**
 * Wire `GET /v1/traces/:traceId`. Auth + rate-limit middlewares
 * run upstream. Returns the full span tree + correlated logs
 * when the user is allowed, 403 when denied, 404 when the trace
 * has no spans.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerDetailRoute = (
  app: Hono<{ Bindings: DetailBindings; Variables: AuthVariables }>
): Hono<{ Bindings: DetailBindings; Variables: AuthVariables }> => {
  app.get('/v1/traces/:traceId', runDetail)
  return app
}
