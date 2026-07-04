const readError = async (res: Response, context: string): Promise<string> => {
  const txt = await res.text().catch(() => '')
  return `${context}: ${res.status} ${txt}`.trim()
}

const throwIfFatal = async (
  res: Response,
  ok: boolean,
  context: string
): Promise<void> =>
  ok ? undefined : Promise.reject(new Error(await readError(res, context)))

/**
 * Assert that a PUT team-membership response landed. 200 = updated,
 * 201 = pending invite created (login not in the org yet); anything
 * else — even 404 — is a real failure and this rejects with the raw
 * GitHub error text so the admin sees the mismatch instead of a
 * silent no-op.
 *
 * @param res Raw fetch Response from the PUT membership call.
 * @param teamSlug Target team's URL slug (used in the error message).
 * @returns Resolves on success; rejects with an Error on failure.
 */
export const requirePut = (res: Response, teamSlug: string): Promise<void> =>
  throwIfFatal(res, res.ok, `add to team ${teamSlug}`)

/**
 * Assert that a DELETE team-membership response landed. 204 = removed,
 * 404 = wasn't a member (both are fine — the desired end state is "not
 * a member"). Anything else rejects with the raw GitHub error text.
 *
 * @param res Raw fetch Response from the DELETE membership call.
 * @param teamSlug Target team's URL slug (used in the error message).
 * @returns Resolves on success; rejects with an Error on failure.
 */
export const requireDelete = (
  res: Response,
  teamSlug: string
): Promise<void> =>
  throwIfFatal(
    res,
    res.ok || res.status === 404,
    `remove from team ${teamSlug}`
  )
