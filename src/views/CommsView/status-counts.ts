import type { Subscriber } from '@/stores/comms'
import { STATUS_ORDER, type SubscriberStatus } from './status-meta'

/** The status filter value: a concrete status, or every subscriber. */
export type StatusFilterValue = 'all' | SubscriberStatus

const tally = (
  subscribers: readonly Subscriber[],
  status: SubscriberStatus
): number => subscribers.filter(s => s.status === status).length

/**
 * Tally subscribers per lifecycle status.
 * @param subscribers The full subscriber list.
 * @returns A count for each status.
 */
export const countByStatus = (
  subscribers: readonly Subscriber[]
): Readonly<Record<SubscriberStatus, number>> => ({
  active: tally(subscribers, 'active'),
  unsubscribed: tally(subscribers, 'unsubscribed'),
  bounced: tally(subscribers, 'bounced'),
  complained: tally(subscribers, 'complained'),
})

/**
 * Filter subscribers by the selected status, or pass them all through.
 * @param subscribers The full subscriber list.
 * @param filter The active status filter.
 * @returns The subscribers matching the filter.
 */
export const filterByStatus = (
  subscribers: readonly Subscriber[],
  filter: StatusFilterValue
): readonly Subscriber[] =>
  filter === 'all'
    ? subscribers
    : subscribers.filter(s => s.status === filter)

export { STATUS_ORDER }
