import { Match } from 'effect'
import { computed } from 'vue'
import { exitFullscreen } from './fullscreen'
import type { ViewerFile } from './types'

/**
 * Reactive position/bounds state derived from the file list + index.
 * @param files - Accessor for the current files.
 * @param index - Accessor for the active index.
 * @returns Total, current file, position label, status text, bounds.
 */
export const useViewerState = (
  files: () => readonly ViewerFile[],
  index: () => number
) => {
  const total = computed(() => files().length)
  const current = computed<ViewerFile | undefined>(() => files()[index()])
  const position = computed(() => `${index() + 1} / ${total.value}`)
  const statusText = computed(() =>
    current.value
      ? `File ${index() + 1} of ${total.value}: ${current.value.name}`
      : ''
  )
  const atStart = computed(() => index() <= 0)
  const atEnd = computed(() => index() >= total.value - 1)
  return { total, current, position, statusText, atStart, atEnd }
}

/**
 * Handle a viewer keydown: arrows page, Escape exits fullscreen or closes.
 * @param e - The keyboard event.
 * @param move - Page-by-step callback.
 * @param close - Close-the-viewer callback.
 * @param isFullscreen - Whether the viewer is currently fullscreen.
 */
export const handleViewerKey = (
  e: KeyboardEvent,
  move: (step: number) => void,
  close: () => void,
  isFullscreen: boolean
): void => {
  const onEscape = (): void => {
    e.preventDefault()
    void (isFullscreen ? exitFullscreen() : close())
  }
  void Match.value(e.key).pipe(
    Match.when('ArrowRight', () => move(1)),
    Match.when('ArrowLeft', () => move(-1)),
    Match.when('Escape', onEscape),
    Match.orElse(() => undefined)
  )
}
