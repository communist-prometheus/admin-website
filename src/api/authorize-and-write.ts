import {
  type AttachBody,
  doWrite,
  requireOrgMember,
} from './tickets-attach-write'

/**
 * Re-derive the caller's authorization (active org member, via their own
 * token) and, only on success, write the attachment with the caller's own
 * token. Role-holders receive `push` on the tickets repo at role
 * assignment, so no service token is involved; a member without push is
 * rejected by GitHub at the write. The gate runs before the write — a
 * non-member never reaches `doWrite`.
 * @param caller The caller's GitHub OAuth token (authorization + write).
 * @param body Validated attachment payload.
 * @returns The write response, or a 403 / 400.
 */
export const authorizeAndWrite = async (
  caller: string,
  body: Partial<AttachBody>
): Promise<Response> => {
  const denied = await requireOrgMember(caller)
  return (
    denied ??
    (body.path && body.content !== undefined
      ? doWrite(caller, {
          path: body.path,
          content: body.content,
          message: body.message ?? '',
        })
      : new Response('Bad attachment payload', { status: 400 }))
  )
}
