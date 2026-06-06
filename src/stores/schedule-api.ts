import { decodeResponse } from '@/validation/decode-response'
import type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'
import { ScheduleWithNextSchema } from '@/validation/schemas/schedule'
import { commsUrl, jsonHeaders } from './comms-http'

/**
 * GET /api/schedule — return the saved schedule with computed `nextRunAt`.
 * @returns Parsed schedule payload.
 */
export const apiGetSchedule = async (): Promise<ScheduleWithNext> => {
  const res = await fetch(commsUrl('/api/schedule'), {
    credentials: 'include',
  })
  return decodeResponse(ScheduleWithNextSchema)(res)
}

/**
 * PUT /api/schedule — persist `{cron, timezone}` and receive the
 * recomputed `nextRunAt` in the response.
 * @param schedule New `{cron, timezone}` pair.
 * @returns Persisted schedule with `nextRunAt`.
 */
export const apiPutSchedule = async (
  schedule: Schedule
): Promise<ScheduleWithNext> => {
  const res = await fetch(commsUrl('/api/schedule'), {
    method: 'PUT',
    credentials: 'include',
    headers: jsonHeaders(),
    body: JSON.stringify(schedule),
  })
  return decodeResponse(ScheduleWithNextSchema)(res)
}
