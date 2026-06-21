import type { NewSubscriber } from './types'
import { EMAIL_RE, isLang, parseLangs } from './validate-helpers'

export type { SubscriberPatch } from './validate-patch'
export { validatePatch } from './validate-patch'

/**
 * Validate the body of `POST /api/subscribers`.
 * @param body Raw parsed JSON body.
 * @returns Normalised subscriber input on success, error code otherwise.
 */
export const validateNewSubscriber = (
  body: unknown
): NewSubscriber | { readonly error: 'email' | 'langs' | 'messageLang' } => {
  if (typeof body !== 'object' || body === null) return { error: 'email' }
  const { email, langs, messageLang } = body as {
    readonly email?: unknown
    readonly langs?: unknown
    readonly messageLang?: unknown
  }
  const parsedLangs = parseLangs(langs)
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { error: 'email' }
  }
  if (parsedLangs === undefined) return { error: 'langs' }
  if (messageLang !== undefined && !isLang(messageLang)) {
    return { error: 'messageLang' }
  }
  // Default the message (chrome) language to English when unspecified.
  return {
    email,
    langs: parsedLangs,
    messageLang: isLang(messageLang) ? messageLang : 'en',
  }
}
