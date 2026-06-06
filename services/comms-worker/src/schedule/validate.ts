import type { Schedule } from '../cron/matcher'
import { validateCron } from '../cron/parse'

/** Result of validating a `PUT /api/schedule` body. */
export type ScheduleValidation =
  | { readonly ok: true; readonly value: Schedule }
  | { readonly ok: false; readonly error: string }

const isValidTz = (tz: string): boolean => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: tz })
    return true
  } catch {
    return false
  }
}

const readShape = (
  body: unknown
): { readonly cron: string; readonly timezone: string } | undefined => {
  if (typeof body !== 'object' || body === null) return undefined
  const { cron, timezone } = body as {
    readonly cron?: unknown
    readonly timezone?: unknown
  }
  if (typeof cron !== 'string' || typeof timezone !== 'string') {
    return undefined
  }
  return { cron, timezone }
}

/**
 * Validate the body of `PUT /api/schedule`.
 * @param body Raw parsed JSON body.
 * @returns Discriminated union; carries either the parsed Schedule
 *   or the error message returned to the client as 422.
 */
export const validateScheduleBody = (body: unknown): ScheduleValidation => {
  const shape = readShape(body)
  if (shape === undefined) {
    return { ok: false, error: 'body must be {cron, timezone}' }
  }
  const cronCheck = validateCron(shape.cron)
  if (!cronCheck.ok) return { ok: false, error: cronCheck.error }
  if (!isValidTz(shape.timezone)) {
    return { ok: false, error: `unknown timezone: ${shape.timezone}` }
  }
  return { ok: true, value: shape }
}
