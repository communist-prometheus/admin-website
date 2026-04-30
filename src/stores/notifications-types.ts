/** Category of a notification — drives styling, icon, and stickiness. */
export type NotificationKind =
  | 'info'
  | 'warn'
  | 'error'
  | 'conflict'
  | 'network'

/** Optional call-to-action attached to a notification entry. */
export type NotificationCta = {
  readonly label: string
  readonly action: () => void
}

/** A single entry stored in the notifications queue. */
export type NotificationEntry = {
  readonly id: string
  readonly kind: NotificationKind
  readonly title: string
  readonly message?: string
  readonly createdAt: number
  readonly cta?: NotificationCta
}

/** Caller-supplied shape — id and createdAt are assigned by the store. */
export type NotificationInput = Omit<NotificationEntry, 'id' | 'createdAt'>
