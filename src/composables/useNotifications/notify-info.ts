import { useNotificationsStore } from '@/stores/notifications'

/**
 * Surface a transient informational notification. Used by the
 * sync pipeline to confirm successful drain operations and other
 * positive feedback that should not block the user.
 * @param msg Human-readable summary shown as the toast body.
 * @returns Id of the emitted notification entry.
 */
export const notifyInfo = (msg: string): string =>
  useNotificationsStore().notify({
    kind: 'info',
    title: 'Info',
    message: msg,
  })
