import { decodeResponse } from '@/validation/decode-response'
import type { RunLogList } from '@/validation/schemas/run-log'
import { RunLogListSchema } from '@/validation/schemas/run-log'
import { commsFetch } from './comms-http'

/**
 * Rows fetched per page. One tick writes one row per recipient, so a
 * single run to the current list already fills most of a page — the old
 * 20-row default made the log look almost empty.
 */
export const RUNS_PAGE_SIZE = 200

/**
 * GET /api/runs — one page of send_log rows joined with the subscriber
 * email, newest first.
 * @param limit Rows to fetch.
 * @param offset Rows to skip, for paging back through history.
 * @returns Parsed list payload.
 */
export const apiListRuns = async (
  limit: number = RUNS_PAGE_SIZE,
  offset = 0
): Promise<RunLogList> => {
  const res = await commsFetch(`/api/runs?limit=${limit}&offset=${offset}`)
  return decodeResponse(RunLogListSchema)(res)
}

/**
 * GET /api/subscribers/:id/runs — the full send history of one address.
 * @param id Subscriber id.
 * @returns Parsed list payload, newest tick first.
 */
export const apiListSubscriberRuns = async (
  id: number
): Promise<RunLogList> => {
  const res = await commsFetch(`/api/subscribers/${id}/runs`)
  return decodeResponse(RunLogListSchema)(res)
}
