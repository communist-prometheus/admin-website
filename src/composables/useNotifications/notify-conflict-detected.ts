import type { NotificationCta } from '@/stores/notifications'
import { useNotificationsStore } from '@/stores/notifications'

const ctaFor = (
  onResolve: (() => void) | undefined
): NotificationCta | undefined =>
  onResolve === undefined
    ? undefined
    : { label: 'Resolve', action: onResolve }

/**
 * Surface a sticky conflict notification listing the file count
 * that needs resolution. When `onResolve` is supplied the toast
 * exposes a "Resolve" CTA wired to it; callers point this at
 * the conflict-resolution view.
 * @param files Paths of files with unresolved merge conflicts.
 * @param onResolve Optional CTA action that opens the resolution UI.
 * @returns Id of the emitted notification entry.
 */
export const notifyConflictDetected = (
  files: ReadonlyArray<string>,
  onResolve?: () => void
): string =>
  useNotificationsStore().notify({
    kind: 'conflict',
    title: 'Merge conflict',
    message: `${files.length} file(s) need resolution`,
    cta: ctaFor(onResolve),
  })
