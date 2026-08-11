import { routeRequest } from '../../handlers/route'
import { log } from '../../logging/logger'
import type { SWFetchRequest, SWFetchResponse } from '../../protocol'

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
 * Handle SW_FETCH — proxy a fetch via MessageChannel.
 * @param msg - Fetch request details
 * @param reply - Callback to send response via MessagePort
 */
export const handleFetchMessage = (
  msg: SWFetchRequest,
  reply: Reply
): void => {
  routeRequest(buildRequest(msg))
    .then(serializeResponse)
    .then(reply)
    .catch(err => {
      log('error', 'cache', `SW_FETCH error: ${err}`)
      reply(errorResponse(err))
    })
}
