import type { Lang } from './types'
import { isLang, parseLangs } from './validate-helpers'
import { isStampError, parseLastSent } from './validate-last-sent'

/** A validated `PATCH /api/subscribers/:id` payload — at least one field. */
export type SubscriberPatch = {
  readonly langs?: ReadonlyArray<Lang>
  readonly messageLang?: Lang
  /**
   * The address's own "what is new" watermark. `null` clears it, which
   * drops the address back to the shared cutoff. Absent means "not part
   * of this patch".
   */
  readonly lastSentAt?: string | null
}

type PatchError = {
  readonly error: 'langs' | 'messageLang' | 'lastSentAt' | 'empty'
}

type Raw = {
  readonly langs?: unknown
  readonly messageLang?: unknown
  readonly lastSentAt?: unknown
}

const isEmpty = (p: SubscriberPatch): boolean =>
  p.langs === undefined &&
  p.messageLang === undefined &&
  p.lastSentAt === undefined

/**
 * Validate the body of `PATCH /api/subscribers/:id`. Accepts `langs`,
 * `messageLang` and/or `lastSentAt`; at least one must be present and
 * valid.
 * @param body Raw parsed JSON body.
 * @returns The fields to update, or an error code.
 */
export const validatePatch = (
  body: unknown
): SubscriberPatch | PatchError => {
  if (typeof body !== 'object' || body === null) return { error: 'empty' }
  const { langs, messageLang, lastSentAt } = body as Raw
  if (langs !== undefined && parseLangs(langs) === undefined)
    return { error: 'langs' }
  if (messageLang !== undefined && !isLang(messageLang))
    return { error: 'messageLang' }
  const stamp = parseLastSent(lastSentAt)
  if (isStampError(stamp)) return stamp
  const out: SubscriberPatch = {
    langs: parseLangs(langs),
    messageLang: isLang(messageLang) ? messageLang : undefined,
    lastSentAt: stamp,
  }
  return isEmpty(out) ? { error: 'empty' } : out
}
