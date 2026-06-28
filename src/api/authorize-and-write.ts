import {
  type AttachBody,
  doWrite,
  requireOrgMember,
} from './tickets-attach-write'

/**
 * Re-derive the caller's authorization (active org member, via their own
 * token) and, only on success, perform the pinned write with the service
 * token. The gate runs before the privileged write — a non-member never
 * reaches `doWrite`.
 * @param caller The caller's GitHub OAuth token (authorization only).
 * @param service The service token used for the write.
 * @param body Validated attachment payload.
 * @returns The write response, or a 403 / 503.
 */
export const authorizeAndWrite = async (
  caller: string,
  service: string | undefined,
  body: Partial<AttachBody>
): Promise<Response> => {
  const denied = await requireOrgMember(caller)
  return (
    denied ??
    (service && body.path && body.content !== undefined
      ? doWrite(service, {
          path: body.path,
          content: body.content,
          message: body.message ?? '',
        })
      : new Response('attachment service not configured', { status: 503 }))
  )
}
