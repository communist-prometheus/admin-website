import { useNotificationsStore } from '@/stores/notifications'

/**
 * Surface a non-sticky error notification reporting which form
 * field violated validation and the human-readable reason. Use
 * for soft validation that the user can correct in-place.
 * @param field Name of the field that failed validation.
 * @param why Reason fragment shown after the field name.
 * @returns Id of the emitted notification entry.
 */
export const notifyValidationError = (field: string, why: string): string =>
  useNotificationsStore().notify({
    kind: 'error',
    title: 'Validation failed',
    message: `${field}: ${why}`,
  })
