import type { Ref } from 'vue'
import { DRAG_THRESHOLD } from './fab-constants'
import type { FabCoords } from './types'

/**
 * Create pointermove handler for drag tracking.
 * @param isDragging - Reactive dragging flag
 * @param dragPos - Reactive drag position
 * @param getPos - Current FAB position getter
 * @param state - Mutable closure state
 * @param state.sX - Start X coordinate
 * @param state.sY - Start Y coordinate
 * @param state.moved - Drag movement flag
 * @returns PointerEvent handler
 */
export const createPointerMove =
  (
    isDragging: Ref<boolean>,
    dragPos: Ref<FabCoords>,
    getPos: () => FabCoords,
    state: { sX: number; sY: number; moved: boolean }
  ) =>
  (e: PointerEvent) => {
    if (!isDragging.value) return
    const dx = e.clientX - state.sX
    const dy = e.clientY - state.sY
    if (Math.abs(dx) + Math.abs(dy) > DRAG_THRESHOLD) state.moved = true
    const b = getPos()
    dragPos.value = { x: b.x + dx, y: b.y + dy }
  }
