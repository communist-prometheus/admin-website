import { LANGS, type Lang, type NewSubscriber } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const allowedLangs = new Set<string>(LANGS)

const isLang = (v: unknown): v is Lang =>
  typeof v === 'string' && allowedLangs.has(v)

/**
 * Validate the body of `POST /api/subscribers`.
 * @param body Raw parsed JSON body.
 * @returns Normalised subscriber input on success, error code otherwise.
 */
export const validateNewSubscriber = (
  body: unknown
): NewSubscriber | { readonly error: 'email' | 'langs' } => {
  if (typeof body !== 'object' || body === null) return { error: 'email' }
  const { email, langs } = body as {
    readonly email?: unknown
    readonly langs?: unknown
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return { error: 'email' }
  }
  if (!Array.isArray(langs) || langs.length === 0 || !langs.every(isLang)) {
    return { error: 'langs' }
  }
  return { email, langs }
}

/**
 * Validate the body of `PATCH /api/subscribers/:id`.
 * @param body Raw parsed JSON body.
 * @returns Langs array on success, error code otherwise.
 */
export const validateLangsPatch = (
  body: unknown
): { readonly langs: ReadonlyArray<Lang> } | { readonly error: 'langs' } => {
  if (typeof body !== 'object' || body === null) return { error: 'langs' }
  const { langs } = body as { readonly langs?: unknown }
  if (!Array.isArray(langs) || langs.length === 0 || !langs.every(isLang)) {
    return { error: 'langs' }
  }
  return { langs }
}
