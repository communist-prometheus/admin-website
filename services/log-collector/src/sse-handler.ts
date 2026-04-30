import type { Context, Hono } from 'hono'
import { type SSEStreamingApi, streamSSE } from 'hono/streaming'
import type { AuthVariables } from './auth-middleware'
import { type SpanFilter, subscribe } from './sse-bus'
import { cursorOf, replayBacklog } from './sse-replay'
import { sendToStream } from './sse-write'

/** Heartbeat cadence — keeps CF Worker streams open. */
export const HEARTBEAT_MS = 20_000

const filterFor = (traceId: string | undefined): SpanFilter =>
  traceId === undefined ? () => true : span => span.traceId === traceId

const startHeartbeat = (
  stream: SSEStreamingApi
): ReturnType<typeof setInterval> =>
  setInterval(() => {
    void stream.write(': heartbeat\n\n')
  }, HEARTBEAT_MS)

const runStream = (c: Context<{ Variables: AuthVariables }>): Response =>
  streamSSE(c, async stream => {
    const filter = filterFor(c.req.query('traceId'))
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
 * (or `?since=`) replay and emits a heartbeat comment every
 * 20 seconds so intermediaries do not drop the connection.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSseRoute = (
  app: Hono<{ Variables: AuthVariables }>
): Hono<{ Variables: AuthVariables }> => {
  app.get('/v1/subscribe', runStream)
  return app
}
