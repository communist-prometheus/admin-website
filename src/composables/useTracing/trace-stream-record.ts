import type { RemoteSpan } from './remote-span'
import type { SseRecord } from './sse-parse'

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object'

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number'

const isStatus = (v: unknown): v is RemoteSpan['status'] =>
  v === 'ok' || v === 'error' || v === 'unset'

const isAttributes = (v: unknown): v is Readonly<Record<string, string>> =>
  isObject(v) && Object.values(v).every(isString)

const isRemoteSpan = (v: unknown): v is RemoteSpan =>
  isObject(v) &&
  isString(v['traceId']) &&
  isString(v['spanId']) &&
  (v['parentSpanId'] === undefined || isString(v['parentSpanId'])) &&
  isString(v['name']) &&
  isNumber(v['startedAt']) &&
  isNumber(v['finishedAt']) &&
  isStatus(v['status']) &&
  isAttributes(v['attributes'])

const safeParse = (raw: string): unknown => {
  try {
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

/**
 * Decode an SSE record into a remote span when it carries the
 * `{ kind: 'span', span: ... }` payload. Unknown or malformed
 * payloads return undefined so callers can ignore them
 * (e.g. `gap` events).
 * @param record SSE record from the parser.
 * @returns Remote span or undefined.
 */
export const recordToSpan = (record: SseRecord): RemoteSpan | undefined => {
  const parsed = safeParse(record.data)
  return isObject(parsed) &&
    parsed['kind'] === 'span' &&
    isRemoteSpan(parsed['span'])
    ? parsed['span']
    : undefined
}
