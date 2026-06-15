import { onBeforeUnmount, onMounted, type Ref } from 'vue'

/** Document/dialog event wiring for the file viewer. */
export type ViewerEventHandlers = {
  readonly onKeydown: (e: KeyboardEvent) => void
  readonly onFullscreenChange: () => void
  readonly onUnmount: () => void
}

/**
 * Open the dialog modally on mount and bind the document listeners the
 * viewer needs (keydown on document — a nav button disabling at an end
 * loses focus, so a dialog-scoped listener would miss arrow keys), then
 * tear them all down on unmount.
 * @param dialog - Ref to the viewer dialog element.
 * @param handlers - Keydown, fullscreen-change, and unmount callbacks.
 */
export const useViewerEvents = (
  dialog: Ref<HTMLDialogElement | null>,
  handlers: ViewerEventHandlers
): void => {
  onMounted(() => {
    dialog.value?.showModal()
    document.addEventListener('keydown', handlers.onKeydown)
    document.addEventListener('fullscreenchange', handlers.onFullscreenChange)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handlers.onKeydown)
    document.removeEventListener(
      'fullscreenchange',
      handlers.onFullscreenChange
    )
    handlers.onUnmount()
  })
}
