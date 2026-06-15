import { type Ref, ref } from 'vue'
import { isDialogFullscreen, toggleFullscreen } from './fullscreen'

/**
 * Track and toggle fullscreen for the viewer dialog.
 * @param dialog - Ref to the viewer dialog element.
 * @returns The isFullscreen flag plus sync + toggle actions.
 */
export const useFullscreen = (dialog: Ref<HTMLDialogElement | null>) => {
  const isFullscreen = ref(false)
  const sync = (): void => {
    isFullscreen.value = isDialogFullscreen(dialog.value)
  }
  const toggle = (): void => {
    toggleFullscreen(dialog.value, isFullscreen.value)
  }
  return { isFullscreen, sync, toggle }
}
