import type { Lang } from './types'
import { isLang, parseLangs } from './validate-helpers'

/** A validated `PATCH /api/subscribers/:id` payload — at least one field. */
export type SubscriberPatch = {
  readonly langs?: ReadonlyArray<Lang>
  readonly messageLang?: Lang
}

type PatchError = { readonly error: 'langs' | 'messageLang' | 'empty' }

/**
 * Validate the body of `PATCH /api/subscribers/:id`. Accepts `langs`
 * and/or `messageLang`; at least one must be present and valid.
 * @param body Raw parsed JSON body.
 * @returns The fields to update, or an error code.
 */
export const validatePatch = (
  body: unknown
): SubscriberPatch | PatchError => {
  if (typeof body !== 'object' || body === null) return { error: 'empty' }
  const { langs, messageLang } = body as {
    readonly langs?: unknown
    readonly messageLang?: unknown
  }
  if (langs !== undefined && parseLangs(langs) === undefined) {
    return { error: 'langs' }
  }
  if (messageLang !== undefined && !isLang(messageLang)) {
    return { error: 'messageLang' }
  }
  const out: SubscriberPatch = {
    langs: parseLangs(langs),
    messageLang: isLang(messageLang) ? messageLang : undefined,
  }
  return out.langs === undefined && out.messageLang === undefined
    ? { error: 'empty' }
    : out
}
