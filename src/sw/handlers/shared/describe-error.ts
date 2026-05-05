/*
 * Build a human-readable message out of whatever the SW just
 * threw. The previous catch in handleCommit unconditionally read
 * `err.message` — but Effect's `Data.TaggedError`, when
 * constructed without a `message` field, leaves the runtime to
 * fall back to its generic string "An error has occurred". The
 * editor then saw `Commit failed: An error has occurred` with
 * zero hint at what actually went wrong.
 *
 * Here we walk the structure: prefer an explicit `.message`,
 * otherwise the `_tag` of the Effect error (so at least the
 * editor sees `Commit failed: ConfigMissingError`), otherwise
 * the cause chain, otherwise the JSON of the error object so
 * something useful surfaces every time.
 */
const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null

const tagOf = (err: Record<string, unknown>): string | undefined => {
  const tag = err['_tag']
  return typeof tag === 'string' ? tag : undefined
}

const messageOf = (err: Record<string, unknown>): string | undefined => {
  const m = err['message']
  return typeof m === 'string' && m.length > 0 ? m : undefined
}

const causeOf = (err: Record<string, unknown>): unknown => err['cause']

/*
 * `tag: cause-message` is the most informative shape — the editor
 * sees both the category (ConfigMissingError, GitError) and the
 * underlying reason (mkdir EEXIST, etc).
 */
const compose = (
  tag: string | undefined,
  message: string | undefined,
  causeMsg: string | undefined,
  fallback: string
): string =>
  tag && causeMsg
    ? `${tag}: ${causeMsg}`
    : (tag ?? message ?? causeMsg ?? fallback)

const describeObject = (err: Record<string, unknown>): string => {
  const cause = causeOf(err)
  const causeMsg =
    cause === undefined || cause === null ? undefined : describeError(cause)
  return compose(tagOf(err), messageOf(err), causeMsg, JSON.stringify(err))
}

/**
 * Coerce any thrown value into a non-empty user-visible string.
 * Preference order: explicit message → tag + cause → JSON dump.
 *
 * @param err Anything thrown / rejected.
 * @returns Description suitable for an error response.
 */
export const describeError = (err: unknown): string =>
  err instanceof Error && err.message.length > 0
    ? err.message
    : typeof err === 'string'
      ? err
      : isObject(err)
        ? describeObject(err)
        : String(err)
