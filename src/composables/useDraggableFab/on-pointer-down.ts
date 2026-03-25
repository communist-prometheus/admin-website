import type { Ref } from 'vue'
import type { FabCoords } from './types'

/**
 * Create pointerdown handler for drag start.
 * @param isDragging - Reactive dragging flag
 * @param dragPos - Reactive drag position
 * @param getPos - Current FAB position getter
 * @param state - Mutable closure state
 * @param state.sX - Start X coordinate
 * @param state.sY - Start Y coordinate
 * @param state.moved - Drag movement flag
 * @returns PointerEvent handler
 */
export const createPointerDown =
  (
    isDragging: Ref<boolean>,
    dragPos: Ref<FabCoords>,
    getPos: () => FabCoords,
    state: { sX: number; sY: number; moved: boolean }
  ) =>
  (e: PointerEvent) => {
    isDragging.value = true
    state.moved = false
    state.sX = e.clientX
    state.sY = e.clientY
    dragPos.value = getPos()
  }
