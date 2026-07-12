import { Schema } from 'effect'

const SendLogStatusSchema = Schema.Literal(
  'sent',
  'failed',
  'bounced',
  'complained',
  'skipped'
)

/** One row in the run-history feed served by `GET /api/runs`. */
export const RunLogSchema = Schema.Struct({
  id: Schema.Number,
  subscriberId: Schema.UndefinedOr(Schema.Number),
  tickAt: Schema.String,
  articleCount: Schema.Number,
  status: SendLogStatusSchema,
  resendId: Schema.UndefinedOr(Schema.String),
  error: Schema.UndefinedOr(Schema.String),
  email: Schema.UndefinedOr(Schema.String),
})

/** Row type derived from the schema. */
export type RunLog = typeof RunLogSchema.Type

/** Wrapper around the list endpoint payload. */
export const RunLogListSchema = Schema.Struct({
  runs: Schema.Array(RunLogSchema),
})

/** List response type. */
export type RunLogList = typeof RunLogListSchema.Type

/** An active address whose most recent send attempt failed. */
export const FailedRecipientSchema = Schema.Struct({
  id: Schema.Number,
  email: Schema.String,
  tickAt: Schema.String,
  error: Schema.UndefinedOr(Schema.String),
})

/** Row type derived from the schema. */
export type FailedRecipient = typeof FailedRecipientSchema.Type

/** Wrapper around the `GET /api/runs/failed` payload. */
export const FailedRecipientListSchema = Schema.Struct({
  recipients: Schema.Array(FailedRecipientSchema),
})

/** List response type. */
export type FailedRecipientList = typeof FailedRecipientListSchema.Type
