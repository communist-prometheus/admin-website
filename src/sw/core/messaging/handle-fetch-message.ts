import { routeRequest } from '../../handlers/route'
import { log } from '../../logging/logger'
import type { SWFetchRequest, SWFetchResponse } from '../../protocol'
import { nonceOk, nonceRejection } from './fetch-nonce-guard'

type Reply = (data: unknown) => void

/**
 * Build a Request from the SW_FETCH message payload.
 * @param msg - Fetch request details
 * @returns Constructed Request
 */
const buildRequest = (msg: SWFetchRequest): Request =>
  new Request(msg.url, {
    method: msg.method ?? 'GET',
    headers: msg.headers,
    body: msg.body,
  })

/**
 * Serialize a Response into a SWFetchResponse payload.
 * @param response - Native Response to serialize
 * @returns Serialized fetch response
 */
const serializeResponse = async (
  response: Response
): Promise<SWFetchResponse> => {
  const body = await response.text()
  const headers: Record<string, string> = {}
  response.headers.forEach((v, k) => {
    headers[k] = v
  })
  return { status: response.status, body, headers }
}

const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)

/**
 * Build an error response payload.
 * @param err - The error that occurred
 * @returns Error fetch response
 */
const errorResponse = (err: unknown): SWFetchResponse => ({
  status: 500,
  body: JSON.stringify({ error: toMessage(err) }),
  headers: { 'content-type': 'application/json' },
})

/**
 * Route a proxied SW_FETCH request and reply with the serialized response.
 * @param request - The reconstructed request
 * @param reply - Callback to send the response via MessagePort
 * @returns void
 */
const routeAndReply = (request: Request, reply: Reply): void => {
  void routeRequest(request)
    .then(serializeResponse)
    .then(reply)
    .catch(err => {
      log('error', 'cache', `SW_FETCH error: ${err}`)
      reply(errorResponse(err))
    })
}

/**
 * Handle SW_FETCH — proxy a fetch via MessageChannel. A `/api/github/*` proxy
 * that lacks the per-session nonce is rejected with 403 (confused-deputy guard).
 * @param msg - Fetch request details
 * @param reply - Callback to send response via MessagePort
 * @returns void
 */
export const handleFetchMessage = (
  msg: SWFetchRequest,
  reply: Reply
): void => {
  const request = buildRequest(msg)
  const { pathname } = new URL(request.url)
  const rejected = pathname.startsWith('/api/github/') && !nonceOk(request)
  const respond = rejected
    ? (): void => reply(nonceRejection)
    : (): void => routeAndReply(request, reply)
  respond()
}
