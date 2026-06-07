import { decodeResponse } from '@/validation/decode-response'
import type { RunLogList } from '@/validation/schemas/run-log'
import { RunLogListSchema } from '@/validation/schemas/run-log'
import { commsFetch } from './comms-http'

/**
 * GET /api/runs — return the most-recent send_log rows joined with
 * the subscriber email. The worker caps the limit at 100.
 * @param limit Optional row cap (defaults to the worker's own default).
 * @returns Parsed list payload.
 */
export const apiListRuns = async (limit?: number): Promise<RunLogList> => {
  const path = limit === undefined ? '/api/runs' : `/api/runs?limit=${limit}`
  const res = await commsFetch(path)
  return decodeResponse(RunLogListSchema)(res)
}
