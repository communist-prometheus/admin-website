import type { Context } from 'hono'
import type { Env } from './app'
import { authorizeAndWrite } from './authorize-and-write'
import { isAllowedOrigin } from './cors-allow'
import type { AttachBody } from './tickets-attach-write'

const SAFE_PATH = /^attachments\/[\w-]+\/[\w.\- ]+$/

const forbidden = (reason: string): Response =>
  new Response(reason, { status: 403 })

/**
 * POST /api/tickets/attach — write a ticket attachment with the CALLER's
 * own token. Role-holders are granted `push` on the tickets repo at role
 * assignment, so no service token is needed. Gates (before any upstream
 * call): Origin, bearer, `attachments/…` path, then the caller's
 * org-membership.
 * @param c Hono context.
 * @returns 200 `{ url }`, or 403 / 400 / 502 per the failing gate.
 */
export const ticketsAttach = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const origin = c.req.header('Origin')
  const caller = (c.req.header('Authorization') ?? '').replace(
    /^Bearer /i,
    ''
  )
  const body: Partial<AttachBody> = await c.req.json().catch(() => ({}))
  return (
    (origin !== undefined && !isAllowedOrigin(origin)
      ? forbidden('Origin not allowed')
      : undefined) ??
    (caller ? undefined : forbidden('Missing token')) ??
    (body.path && SAFE_PATH.test(body.path)
      ? undefined
      : forbidden('Bad attachment path')) ??
    authorizeAndWrite(caller, body)
  )
}
