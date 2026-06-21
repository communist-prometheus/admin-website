import type { Context } from 'hono'
import type { SubscriberRepo } from './repo'
import { parseId } from './route-helpers'
import { isDuplicateError } from './types'
import { validateNewSubscriber } from './validate'

export { parseId } from './route-helpers'
export { handlePatch } from './route-patch'

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
