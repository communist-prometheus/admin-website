import {
  type NotificationCta,
  useNotificationsStore,
} from '@/stores/notifications'
import { pushFailureCopy } from './push-failure-copy'
import type { PushFailureReason } from './push-failure-types'

const decorate = (base: string, target: string | undefined): string =>
  target === undefined ? base : `${base} (${target})`

const ctaFor = (
  onRetry: (() => void) | undefined
): NotificationCta | undefined =>
  onRetry === undefined ? undefined : { label: 'Retry', action: onRetry }

/**
 * Surface a sticky error notification describing why the latest
 * push attempt failed. Optional target ref (e.g. `origin/develop`)
 * is appended to the message so the user knows which remote was
 * affected when several are configured. When `onRetry` is
 * supplied the toast exposes a Retry CTA wired to it.
 * @param reason Classified push failure reason.
 * @param target Optional remote ref to disambiguate the message.
 * @param onRetry Optional callback wired to the Retry CTA.
 * @returns Id of the emitted notification entry.
 */
export const notifyPushFailure = (
  reason: PushFailureReason,
  target?: string,
  onRetry?: () => void
): string => {
  const copy = pushFailureCopy(reason)
  return useNotificationsStore().notify({
    kind: 'error',
    title: copy.title,
    message: decorate(copy.message, target),
    cta: ctaFor(onRetry),
  })
}
