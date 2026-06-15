import { fireAndForward } from '@/utils/fire-and-forward'

/**
 * Whether the given dialog is the current fullscreen element.
 * @param dialog - The viewer dialog element (or null before mount).
 * @returns True when the dialog is fullscreen.
 */
export const isDialogFullscreen = (
  dialog: HTMLDialogElement | null
): boolean => document.fullscreenElement === dialog

/**
 * Exit fullscreen when anything is currently fullscreen; no-op otherwise.
 */
export const exitFullscreen = (): void => {
  void (document.fullscreenElement
    ? fireAndForward(document.exitFullscreen())
    : undefined)
}

/**
 * Toggle fullscreen for the dialog given the current state.
 * @param dialog - The viewer dialog element (or null).
 * @param isFullscreen - Whether the dialog is already fullscreen.
 */
export const toggleFullscreen = (
  dialog: HTMLDialogElement | null,
  isFullscreen: boolean
): void => {
  void (isFullscreen || !dialog
    ? exitFullscreen()
    : fireAndForward(dialog.requestFullscreen()))
}
