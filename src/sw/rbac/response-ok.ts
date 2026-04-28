/**
 * Throw a meaningful error when a GitHub API response is not OK.
 * Reads a tiny slice of the response body so the message is
 * actionable. 404 is treated as a soft success on the
 * `clearReservedTeams` path (the user simply was not in the team).
 *
 * @param res - Raw fetch Response
 * @param label - Operation label included in the thrown message
 * @returns Resolves on OK, rejects with the body excerpt otherwise
 */
export const ensureOk = async (
  res: Response,
  label: string
): Promise<void> => {
  const detail = res.ok ? '' : (await res.text().catch(() => '')) || ''
  return res.ok
    ? undefined
    : Promise.reject(
        new Error(`${label} ${res.status}: ${detail.slice(0, 200)}`)
      )
}
