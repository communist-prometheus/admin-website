import { Schema } from 'effect'

/** Saved newsletter schedule: 5-field cron + IANA timezone. */
export const ScheduleSchema = Schema.Struct({
  cron: Schema.String,
  timezone: Schema.String,
})

/** Plain `{cron, timezone}` type used on PUT bodies. */
export type Schedule = typeof ScheduleSchema.Type

/** Server response shape — adds the next computed UTC fire time. */
export const ScheduleWithNextSchema = Schema.Struct({
  cron: Schema.String,
  timezone: Schema.String,
  nextRunAt: Schema.String,
})

/** Response type derived from {@link ScheduleWithNextSchema}. */
export type ScheduleWithNext = typeof ScheduleWithNextSchema.Type
