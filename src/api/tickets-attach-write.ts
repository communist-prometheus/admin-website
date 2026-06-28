const GH = 'https://api.github.com'
const TICKETS = 'communist-prometheus/tickets'
const ORG = 'communist-prometheus'

/** Validated attachment write payload. */
export interface AttachBody {
  readonly path: string
  readonly content: string
  readonly message: string
}

const ghHeaders = (token: string): HeadersInit => ({
  Authorization: `Bearer ${token}`,
  Accept: 'application/vnd.github+json',
})

const blobUrl = (path: string): string =>
  `https://github.com/${TICKETS}/blob/master/${path}`

/**
 * Confused-deputy gate: verify the CALLER is an active org member using
 * the caller's OWN token (state they cannot set), BEFORE the service token
 * is ever used. Returns a 403 Response to short-circuit, or undefined to
 * proceed.
 * @param token The caller's GitHub OAuth token.
 * @returns 403 Response when not an active member, else undefined.
 */
export const requireOrgMember = async (
  token: string
): Promise<Response | undefined> => {
  const res = await fetch(`${GH}/user/memberships/orgs/${ORG}`, {
    headers: ghHeaders(token),
  })
  const body = await res.json().catch(() => ({}))
  return res.ok && body?.state === 'active'
    ? undefined
    : new Response('Not an active org member', { status: 403 })
}

/**
 * Write one attachment to the pinned tickets-repo path using the service
 * token (never the caller's). Returns the blob URL on success.
 * @param service Service token with write on the tickets repo.
 * @param body Validated path + base64 content + commit message.
 * @returns 200 `{ url }` on success, 502 on upstream failure.
 */
export const doWrite = async (
  service: string,
  body: AttachBody
): Promise<Response> => {
  const res = await fetch(`${GH}/repos/${TICKETS}/contents/${body.path}`, {
    method: 'PUT',
    headers: { ...ghHeaders(service), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: body.message,
      content: body.content,
      branch: 'master',
    }),
  })
  return res.ok
    ? Response.json({ url: blobUrl(body.path) })
    : new Response(`Upload failed: ${res.status}`, { status: 502 })
}
