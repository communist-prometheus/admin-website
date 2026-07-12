import type { Context } from 'hono'
import type { SubscriberRepo } from './repo'
import { parseId } from './route-helpers'
import type { Subscriber } from './types'
import { type SubscriberPatch, validatePatch } from './validate'

const applyPatch = async (
  repo: SubscriberRepo,
  id: number,
  patch: SubscriberPatch
): Promise<Subscriber | undefined> => {
  const afterLangs =
    patch.langs !== undefined
      ? await repo.updateLangs(id, patch.langs)
      : undefined
  const afterMsg =
    patch.messageLang !== undefined
      ? await repo.updateMessageLang(id, patch.messageLang)
      : undefined
  const afterSent =
    patch.lastSentAt !== undefined
      ? await repo.setLastSentAt(id, patch.lastSentAt ?? undefined)
      : undefined
  return afterSent ?? afterMsg ?? afterLangs
}

/**
 * PATCH /api/subscribers/:id — update `langs`, `messageLang` and/or
 * `lastSentAt` (the address's own watermark; `null` clears it).
 */
export const handlePatch = async (
  c: Context,
  repo: SubscriberRepo
): Promise<Response> => {
  const id = parseId(c.req.param('id'))
  if (id === undefined) return c.json({ error: 'not_found' }, 404)
  const body = await c.req.json().catch(() => undefined)
  const parsed = validatePatch(body)
  if ('error' in parsed) return c.json({ error: parsed.error }, 422)
  const updated = await applyPatch(repo, id, parsed)
  return updated === undefined
    ? c.json({ error: 'not_found' }, 404)
    : c.json(updated)
}
