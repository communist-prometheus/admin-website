import { commsFetch, ensureOk, jsonHeaders } from './comms-http'

/** Shape of the `/api/cutoff` GET response. */
export type CutoffResponse = {
  readonly at: string | null
}

const isObject = (x: unknown): x is Record<string, unknown> =>
  x !== null && typeof x === 'object'

const isCutoff = (value: unknown): value is CutoffResponse =>
  isObject(value) && (value['at'] === null || typeof value['at'] === 'string')

/**
 * GET /api/cutoff — read the global dispatch cutoff watermark.
 * Returns `{ at: ISO }` when set, `{ at: null }` when no cutoff has
 * been recorded yet.
 * @returns Parsed cutoff payload.
 */
export const apiGetCutoff = async (): Promise<CutoffResponse> => {
  const res = ensureOk(await commsFetch('/api/cutoff'), 'Get cutoff')
  const body: unknown = await res.json().catch(() => undefined)
  return isCutoff(body)
    ? body
    : (() => {
        throw new Error('Get cutoff: malformed response')
      })()
}

/**
 * PUT /api/cutoff — manually override the cutoff. Pass `null` to
 * clear and re-include every RSS item on the next dispatch.
 * @param at ISO string or null.
 * @returns Persisted state.
 */
export const apiPutCutoff = async (
  at: string | null
): Promise<CutoffResponse> => {
  const res = ensureOk(
    await commsFetch('/api/cutoff', {
      method: 'PUT',
      headers: jsonHeaders(),
      body: JSON.stringify({ at }),
    }),
    'Save cutoff'
  )
  const body: unknown = await res.json().catch(() => undefined)
  return isCutoff(body)
    ? body
    : (() => {
        throw new Error('Save cutoff: malformed response')
      })()
}
