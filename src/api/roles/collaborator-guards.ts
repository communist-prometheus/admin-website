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
 * Assert that a PUT collaborator response landed.
 * 201 = invite created, 204 = permission already matched, 200 = updated;
 * anything else — including 403 (insufficient scope on the caller's
 * token), 404 (repo/login typo), 422 (org policy blocks direct collabs)
 * — rejects with the raw GitHub message so the admin sees the reason.
 *
 * @param res Fetch Response from the PUT collaborator call.
 * @returns Resolves on success; rejects with an Error on failure.
 */
export const requirePutCollab = (res: Response): Promise<void> =>
  throwIfFatal(res, res.ok, 'grant content push')

/**
 * Assert that a DELETE collaborator response landed. 204 = removed,
 * 404 = wasn't a collaborator (both fine — desired end state is "no
 * write"). Anything else rejects with the GitHub error text.
 *
 * @param res Fetch Response from the DELETE collaborator call.
 * @returns Resolves on success; rejects with an Error on failure.
 */
export const requireDeleteCollab = (res: Response): Promise<void> =>
  throwIfFatal(res, res.ok || res.status === 404, 'revoke content access')
