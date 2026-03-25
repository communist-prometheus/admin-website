import { ref } from 'vue'
import { createHandlers, fabPos } from './create-handlers'
import { loadCorner } from './persist-corner'
import type { Corner, FabCoords } from './types'

/**
 * Draggable FAB corner composable.
 * Manages pointer tracking, snapping, and persistence.
 * @returns Reactive state and pointer event handlers
 */
export const useDraggableFab = () => {
  const corner = ref<Corner>(loadCorner())
  const isDragging = ref(false)
  const dragPos = ref<FabCoords>({ x: 0, y: 0 })
  const h = createHandlers(corner, isDragging, dragPos)

  return {
    corner,
    isDragging,
    dragPos,
    moved: h.moved,
    pos: () => fabPos(corner.value),
    onPointerdown: h.down,
    onPointermove: h.move,
    onPointerup: h.up,
  }
}
