import type { Context, Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { AuthVariables } from './auth-middleware'
import { type SpanFilter, subscribe } from './sse-bus'

const filterFor = (traceId: string | undefined): SpanFilter =>
  traceId === undefined ? () => true : span => span.traceId === traceId

const runStream = (
  c: Context<{ Variables: AuthVariables }>
): Response | Promise<Response> => {
  const traceId = c.req.query('traceId')
  return streamSSE(c, async stream => {
    const filter = filterFor(traceId)
    const dispose = subscribe({
      filter,
      send: span => {
        void stream.writeSSE({
          data: JSON.stringify({ kind: 'span', span }),
        })
      },
    })
    await new Promise<void>(resolve => {
      stream.onAbort(() => {
        dispose()
        resolve()
      })
    })
  })
}

/**
 * Wire `GET /v1/subscribe`. Auth and rate-limit middlewares run
 * upstream in `index.ts`. The endpoint streams `text/event-stream`
 * with one event per ingested span; the optional `traceId`
 * query filters to a single trace.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSseRoute = (
  app: Hono<{ Variables: AuthVariables }>
): Hono<{ Variables: AuthVariables }> => {
  app.get('/v1/subscribe', runStream)
  return app
}
