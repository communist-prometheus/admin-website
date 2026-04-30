import type { Context, Hono } from 'hono'
import type { AuthVariables } from './auth-middleware'
import { parseLogBatch, parseTraceBatch } from './otlp-validate'
import { broadcast } from './sse-bus'
import { persistLogs, persistSpans } from './storage'
import type { StorageBindings } from './storage-types'

/** Bindings the OTLP routes read off the worker env. */
export type OtlpBindings = StorageBindings

const handleTraces = async (
  c: Context<{ Bindings: OtlpBindings; Variables: AuthVariables }>
): Promise<Response> => {
  const body: unknown = await c.req.json().catch(() => undefined)
  const spans = parseTraceBatch(body)
  return spans.length === 0
    ? c.json({ error: 'no valid spans in batch' }, 422)
    : runPersistSpans(c, spans)
}

const runPersistSpans = async (
  c: Context<{ Bindings: OtlpBindings; Variables: AuthVariables }>,
  spans: ReturnType<typeof parseTraceBatch>
): Promise<Response> => {
  const user = c.get('user').sub
  await persistSpans(c.env, spans, user)
  spans.forEach(broadcast)
  return c.json({ accepted: spans.length })
}

const handleLogs = async (
  c: Context<{ Bindings: OtlpBindings; Variables: AuthVariables }>
): Promise<Response> => {
  const body: unknown = await c.req.json().catch(() => undefined)
  const logs = parseLogBatch(body)
  return logs.length === 0
    ? c.json({ error: 'no valid logs in batch' }, 422)
    : runPersistLogs(c, logs)
}

const runPersistLogs = async (
  c: Context<{ Bindings: OtlpBindings; Variables: AuthVariables }>,
  logs: ReturnType<typeof parseLogBatch>
): Promise<Response> => {
  await persistLogs(c.env, logs)
  return c.json({ accepted: logs.length })
}

/**
 * Wire `POST /v1/traces` and `POST /v1/logs`. Both routes are
 * gated by the auth middleware in `src/index.ts`; the handlers
 * therefore trust `c.get('user')`.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerOtlpRoutes = (
  app: Hono<{ Bindings: OtlpBindings; Variables: AuthVariables }>
): Hono<{ Bindings: OtlpBindings; Variables: AuthVariables }> => {
  app.post('/v1/traces', handleTraces)
  app.post('/v1/logs', handleLogs)
  return app
}
