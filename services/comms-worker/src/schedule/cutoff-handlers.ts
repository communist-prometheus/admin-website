import type { Context } from 'hono'
import type { SettingsRepo } from '../settings/repo'

const isValidIso = (s: unknown): s is string =>
  typeof s === 'string' && Number.isFinite(Date.parse(s))

/**
 * GET /api/cutoff — return the global cutoff watermark used by the
 * dispatch loop. Body is `{ at: "ISO" }` when set, `{ at: null }`
 * when no cutoff has been recorded yet (fresh install or after a
 * manual reset).
 * @param c Hono context.
 * @param repo Settings repo.
 * @returns JSON `{ at: string | null }`.
 */
export const handleGetCutoff = async (
  c: Context,
  repo: SettingsRepo
): Promise<Response> => {
  const at = await repo.getCutoffAt()
  return c.json({ at: at ?? null })
}

/**
 * PUT /api/cutoff — manually override the cutoff watermark. Body is
 * `{ at: "ISO" }` to set, `{ at: null }` to clear. Returns the new
 * state.
 * @param c Hono context.
 * @param repo Settings repo.
 * @returns JSON `{ at: string | null }`.
 */
export const handlePutCutoff = async (
  c: Context,
  repo: SettingsRepo
): Promise<Response> => {
  const body: unknown = await c.req.json().catch(() => undefined)
  const at =
    body !== null && typeof body === 'object'
      ? (body as { at: unknown }).at
      : undefined
  if (at === null) {
    await repo.clearCutoffAt()
    return c.json({ at: null })
  }
  if (!isValidIso(at)) {
    return c.json({ error: 'body must be { at: ISO } or { at: null }' }, 422)
  }
  await repo.setCutoffAt(at)
  return c.json({ at })
}
