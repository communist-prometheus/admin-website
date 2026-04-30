import type { Context, Hono } from 'hono'
import { type SSEStreamingApi, streamSSE } from 'hono/streaming'
import type { AuthVariables } from './auth-middleware'
import { buildRbac, type RbacBindings } from './rbac-policy'
import { subscribe } from './sse-bus'
import { composeFilters, rbacFilter, traceIdFilter } from './sse-filter'
import { cursorOf, replayBacklog } from './sse-replay'
import { sendToStream } from './sse-write'

/** Heartbeat cadence — keeps CF Worker streams open. */
export const HEARTBEAT_MS = 20_000

/** Bindings the SSE handler reads from the env. */
export type SseBindings = RbacBindings

const startHeartbeat = (
  stream: SSEStreamingApi
): ReturnType<typeof setInterval> =>
  setInterval(() => {
    void stream.write(': heartbeat\n\n')
  }, HEARTBEAT_MS)

const runStream = (
  c: Context<{ Bindings: SseBindings; Variables: AuthVariables }>
): Response =>
  streamSSE(c, async stream => {
    const ctx = buildRbac(c.env, c.get('user').sub)
    const filter = composeFilters(
      traceIdFilter(c.req.query('traceId')),
      rbacFilter(ctx)
    )
    await replayBacklog(stream, cursorOf(c), filter)
    const dispose = subscribe({ filter, send: sendToStream(stream, filter) })
    const heartbeat = startHeartbeat(stream)
    await new Promise<void>(resolve => {
      stream.onAbort(() => {
        clearInterval(heartbeat)
        dispose()
        resolve()
      })
    })
  })

/**
 * Wire `GET /v1/subscribe`. Auth and rate-limit middlewares run
 * upstream in `index.ts`. The endpoint streams `text/event-stream`
 * with one event per ingested span; supports `Last-Event-ID`
 * (or `?since=`) replay, emits a heartbeat comment every
 * 20 seconds, and applies the RBAC policy so non-admins only
 * see spans whose `org` attribute matches their JWT subject.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSseRoute = (
  app: Hono<{ Bindings: SseBindings; Variables: AuthVariables }>
): Hono<{ Bindings: SseBindings; Variables: AuthVariables }> => {
  app.get('/v1/subscribe', runStream)
  return app
}
