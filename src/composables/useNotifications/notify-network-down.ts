import type { NotificationCta } from '@/stores/notifications'
import { useNotificationsStore } from '@/stores/notifications'

const ctaFor = (
  onRetry: (() => void) | undefined
): NotificationCta | undefined =>
  onRetry === undefined ? undefined : { label: 'Retry', action: onRetry }

/**
 * Surface a sticky network notification telling the user the app
 * is operating offline. When `onRetry` is supplied the toast
 * exposes a "Retry" CTA wired to it; callers should use this to
 * trigger the queued sync drain (Epic 3).
 * @param onRetry Optional CTA action that resumes connectivity attempts.
 * @returns Id of the emitted notification entry.
 */
export const notifyNetworkDown = (onRetry?: () => void): string =>
  useNotificationsStore().notify({
    kind: 'network',
    title: 'Working offline',
    message: 'Network unreachable',
    cta: ctaFor(onRetry),
  })
