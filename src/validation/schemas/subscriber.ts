import { Schema } from 'effect'

const LangSchema = Schema.Literal('en', 'ru', 'it', 'es', 'uk', 'pl', 'bl')

/** Newsletter subscriber, mirrors comms-worker D1 `subscribers` row. */
export const SubscriberSchema = Schema.Struct({
  id: Schema.Number,
  email: Schema.String,
  langs: Schema.Array(LangSchema),
  status: Schema.Literal('active', 'unsubscribed', 'bounced', 'complained'),
  createdAt: Schema.String,
  lastSentAt: Schema.UndefinedOr(Schema.String),
  unsubscribedAt: Schema.UndefinedOr(Schema.String),
})

/** Subscriber type derived from the schema. */
export type Subscriber = typeof SubscriberSchema.Type

/** Language type derived from the schema. */
export type Lang = typeof LangSchema.Type

/** Wrapper for the list endpoint. */
export const SubscribersListSchema = Schema.Struct({
  subscribers: Schema.Array(SubscriberSchema),
})

/** List response type. */
export type SubscribersList = typeof SubscribersListSchema.Type
