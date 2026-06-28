interface AttachDeps {
  readonly token: string
  readonly path: string
  readonly content: string
  readonly message: string
}

const messageFor = (status: number): string =>
  status === 403
    ? 'not authorized to attach to the tickets repo'
    : status === 503
      ? 'attachment service is not configured'
      : `Upload failed: ${status}`

/**
 * Upload one attachment through the same-origin worker proxy, which writes
 * to the private tickets repo with a service token. The caller's GitHub
 * token is sent only so the worker can verify the caller is an org member;
 * the editor needs no direct access to the tickets repo. Best-effort —
 * throws on failure so the caller can surface it without blocking the
 * ticket.
 * @param deps Caller token + repo-relative path + base64 content + message.
 * @returns Resolves when stored; rejects with an actionable reason on
 *   failure (403 → not authorized, 503 → service unconfigured).
 */
export const proxyAttach = async (deps: AttachDeps): Promise<void> => {
  const res = await fetch('/api/tickets/attach', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${deps.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path: deps.path,
      content: deps.content,
      message: deps.message,
    }),
  })
  return res.ok
    ? undefined
    : Promise.reject(new Error(messageFor(res.status)))
}
