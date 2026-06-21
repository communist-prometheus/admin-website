import type { Subscriber } from '@/stores/comms'

/** One of the four subscriber lifecycle states. */
export type SubscriberStatus = Subscriber['status']

/** Display metadata for a subscriber lifecycle status. */
export type StatusMeta = {
  readonly icon: string
  readonly label: string
  readonly description: string
}

/** Canonical display order for the status filter + legend. */
export const STATUS_ORDER: ReadonlyArray<SubscriberStatus> = [
  'active',
  'unsubscribed',
  'bounced',
  'complained',
]

/** Icon, short label, and plain-language meaning for every status. */
export const STATUS_META: Readonly<Record<SubscriberStatus, StatusMeta>> = {
  active: {
    icon: '●',
    label: 'Active',
    description:
      'Receiving the newsletter — included in every scheduled send.',
  },
  unsubscribed: {
    icon: '○',
    label: 'Unsubscribed',
    description: 'Opted out via the unsubscribe link — never sent to again.',
  },
  bounced: {
    icon: '⚠',
    label: 'Bounced',
    description:
      'Mail server rejected delivery — skipped to protect sending reputation.',
  },
  complained: {
    icon: '⚠',
    label: 'Complained',
    description: 'Reported a send as spam — skipped permanently.',
  },
}
