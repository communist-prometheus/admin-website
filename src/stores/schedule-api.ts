import { decodeResponse } from '@/validation/decode-response'
import type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'
import { ScheduleWithNextSchema } from '@/validation/schemas/schedule'
import { commsFetch, jsonHeaders } from './comms-http'

/**
 * GET /api/schedule — return the saved schedule with computed `nextRunAt`.
 * @returns Parsed schedule payload.
 */
export const apiGetSchedule = async (): Promise<ScheduleWithNext> => {
  const res = await commsFetch('/api/schedule')
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
  const res = await commsFetch('/api/schedule', {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(schedule),
  })
  return decodeResponse(ScheduleWithNextSchema)(res)
}
