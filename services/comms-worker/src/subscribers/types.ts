/** Languages supported by the site (matches Astro SUPPORTED_LANGUAGES). */
export const LANGS = ['en', 'ru', 'it', 'es', 'uk', 'pl', 'bl'] as const

/** A single language code; narrow string type. */
export type Lang = (typeof LANGS)[number]

/** Lifecycle status carried by every subscriber row. */
export type SubscriberStatus =
  | 'active'
  | 'unsubscribed'
  | 'bounced'
  | 'complained'

/** Domain representation of a `subscribers` row. */
export type Subscriber = {
  readonly id: number
  readonly email: string
  readonly langs: ReadonlyArray<Lang>
  /** Language of the email shell (subject/intro/footer); content uses `langs`. */
  readonly messageLang: Lang
  readonly status: SubscriberStatus
  readonly createdAt: string
  readonly lastSentAt: string | undefined
  readonly unsubscribedAt: string | undefined
}

/** Inputs accepted by the `insert` repo call. */
export type NewSubscriber = {
  readonly email: string
  readonly langs: ReadonlyArray<Lang>
  /** Message (chrome) language; defaults to English when omitted. */
  readonly messageLang?: Lang
  /**
   * Seed for the address's own "what is new" watermark. Callers pass the
   * shared cutoff so a new address starts level with the list; defaults
   * to the moment of signup.
   */
  readonly lastSentAt?: string
}

/** Sentinel name used by `DuplicateError` instances. */
export const DUPLICATE_ERROR_NAME = 'DuplicateError'

/** Error tag carried on the throw path for active-email dupes. */
export type DuplicateError = Error & { readonly name: 'DuplicateError' }

/**
 * Construct a `DuplicateError` for the given email.
 * @param email Email that collided with an existing active row.
 * @returns Tagged error suitable for `throw`.
 */
export const newDuplicateError = (email: string): DuplicateError => {
  const e = new Error(`subscriber already exists: ${email}`) as DuplicateError
  Object.assign(e, { name: DUPLICATE_ERROR_NAME })
  return e
}

/** Type guard for `DuplicateError`. */
export const isDuplicateError = (e: unknown): e is DuplicateError =>
  e instanceof Error && e.name === DUPLICATE_ERROR_NAME
