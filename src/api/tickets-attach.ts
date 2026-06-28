import type { Context } from 'hono'
import type { Env } from './app'
import { authorizeAndWrite } from './authorize-and-write'
import { isAllowedOrigin } from './cors-allow'
import type { AttachBody } from './tickets-attach-write'

const SAFE_PATH = /^attachments\/[\w-]+\/[\w.\- ]+$/

const forbidden = (reason: string): Response =>
  new Response(reason, { status: 403 })

/**
 * POST /api/tickets/attach — write a ticket attachment with the service
 * token so an editor needs no direct tickets-repo access. Gates (before any
 * upstream call): Origin, bearer, service configured, `attachments/…` path,
 * then the caller's org-membership.
 * @param c Hono context (Env carries the TICKETS_TOKEN secret).
 * @returns 200 `{ url }`, or 403 / 503 / 502 per the failing gate.
 */
export const ticketsAttach = async (
  c: Context<{ Bindings: Env }>
): Promise<Response> => {
  const origin = c.req.header('Origin')
  const caller = (c.req.header('Authorization') ?? '').replace(
    /^Bearer /i,
    ''
  )
  const service = c.env.TICKETS_TOKEN
  const body: Partial<AttachBody> = await c.req.json().catch(() => ({}))
  return (
    (origin !== undefined && !isAllowedOrigin(origin)
      ? forbidden('Origin not allowed')
      : undefined) ??
    (caller ? undefined : forbidden('Missing token')) ??
    (service
      ? undefined
      : new Response('attachment service not configured', { status: 503 })) ??
    (body.path && SAFE_PATH.test(body.path)
      ? undefined
      : forbidden('Bad attachment path')) ??
    authorizeAndWrite(caller, service, body)
  )
}
