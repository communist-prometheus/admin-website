import type { Context } from 'hono'
import type { SubscriberRepo } from './repo'
import { isDuplicateError } from './types'
import { validateLangsPatch, validateNewSubscriber } from './validate'

/** Parse a positive integer from a path param. */
export const parseId = (raw: string): number | undefined => {
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** POST /api/subscribers — create. */
export const handleCreate = async (
  c: Context,
  repo: SubscriberRepo
): Promise<Response> => {
  const body = await c.req.json().catch(() => undefined)
  const parsed = validateNewSubscriber(body)
  if ('error' in parsed) return c.json({ error: parsed.error }, 422)
  try {
    return c.json(await repo.insert(parsed), 201)
  } catch (e) {
    if (isDuplicateError(e)) return c.json({ error: 'duplicate' }, 409)
    throw e
  }
}

/** PATCH /api/subscribers/:id — replace langs. */
export const handlePatch = async (
  c: Context,
  repo: SubscriberRepo
): Promise<Response> => {
  const id = parseId(c.req.param('id'))
  if (id === undefined) return c.json({ error: 'not_found' }, 404)
  const body = await c.req.json().catch(() => undefined)
  const parsed = validateLangsPatch(body)
  if ('error' in parsed) return c.json({ error: parsed.error }, 422)
  const updated = await repo.updateLangs(id, parsed.langs)
  return updated === undefined
    ? c.json({ error: 'not_found' }, 404)
    : c.json(updated)
}

/** DELETE /api/subscribers/:id — hard delete. */
export const handleDelete = async (
  c: Context,
  repo: SubscriberRepo
): Promise<Response> => {
  const id = parseId(c.req.param('id'))
  if (id === undefined) return c.json({ error: 'not_found' }, 404)
  return (await repo.remove(id))
    ? c.body(null, 204)
    : c.json({ error: 'not_found' }, 404)
}
