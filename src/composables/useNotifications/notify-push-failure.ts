import { useNotificationsStore } from '@/stores/notifications'
import { pushFailureCopy } from './push-failure-copy'
import type { PushFailureReason } from './push-failure-types'

const decorate = (base: string, target: string | undefined): string =>
  target === undefined ? base : `${base} (${target})`

/**
 * Surface a sticky error notification describing why the latest
 * push attempt failed. Optional target ref (e.g. `origin/develop`)
 * is appended to the message so the user knows which remote was
 * affected when several are configured.
 * @param reason Classified push failure reason.
 * @param target Optional remote ref to disambiguate the message.
 * @returns Id of the emitted notification entry.
 */
export const notifyPushFailure = (
  reason: PushFailureReason,
  target?: string
): string => {
  const copy = pushFailureCopy(reason)
  return useNotificationsStore().notify({
    kind: 'error',
    title: copy.title,
    message: decorate(copy.message, target),
  })
}
