/** Shape of the auth-worker `/auth/session` response. */
export type SessionPayload = {
  readonly login: string
  readonly roles: ReadonlyArray<string>
  readonly expires: number
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isStringArray = (x: unknown): x is ReadonlyArray<string> =>
  Array.isArray(x) && x.every(item => typeof item === 'string')

/**
 * Structural type guard for the session payload returned by
 * `auth-worker`. Used after `JSON.parse` so handlers can stay free
 * of `as` assertions.
 * @param value Result of `JSON.parse`.
 * @returns True iff value matches the `SessionPayload` shape.
 */
export const isSessionPayload = (value: unknown): value is SessionPayload =>
  isObject(value) &&
  typeof value['login'] === 'string' &&
  isStringArray(value['roles']) &&
  typeof value['expires'] === 'number'

/**
 * Read + validate the auth-worker response body. Returns undefined
 * on parse failure or shape mismatch so the caller can map both to
 * a single "mint failed" outcome.
 * @param res Fetch Response from `/auth/session`.
 * @returns Decoded payload, or undefined.
 */
export const readPayload = async (
  res: Response
): Promise<SessionPayload | undefined> => {
  const body: unknown = await res.json().catch(() => undefined)
  return isSessionPayload(body) ? body : undefined
}
