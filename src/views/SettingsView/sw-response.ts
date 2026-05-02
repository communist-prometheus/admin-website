/*
 * Shared swFetch response guard. The bridge resolves regardless of
 * the underlying status; without this guard a 4xx/5xx silently
 * counts as success, the UI calls reload(), and the editor sees
 * the same stale row — exactly the role-change "doesn't work"
 * pattern flagged in memory (feedback_silent_failures_in_rbac.md).
 */

const errorBody = async (res: Response): Promise<string> => {
  const txt = await res.text().catch(() => '')
  return txt.length > 0 ? txt : `github ${res.status}`
}

/**
 * Reject the swFetch result when the response status is not OK,
 * propagating GitHub's own error body in the rejection so the
 * dialog can surface a useful message.
 *
 * @param res Response from a `swFetch` call.
 * @returns The original Response when ok, rejected promise otherwise.
 */
export const okOrThrow = async (res: Response): Promise<Response> =>
  res.ok ? res : Promise.reject(new Error(await errorBody(res)))
