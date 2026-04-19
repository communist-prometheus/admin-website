import type { Ref } from 'vue'

/**
 * Create drag event handlers for PDF dropzone.
 * @param dragging - Reactive dragging state
 * @param onFile - Callback for dropped file
 * @returns Drag event handlers
 */
export const createDragHandlers = (
  dragging: Ref<boolean>,
  onFile: (file: File) => void
) => ({
  onDrop: (event: DragEvent) => {
    dragging.value = false
    const file = event.dataTransfer?.files[0]
    if (file) onFile(file)
  },
  onDragOver: (event: DragEvent) => {
    event.preventDefault()
    dragging.value = true
  },
  onDragLeave: () => {
    dragging.value = false
  },
})
