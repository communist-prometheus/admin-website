import type { Ref } from 'vue'
import { cornerPosition } from './corner-position'
import { FAB_MARGIN, FAB_SIZE } from './fab-constants'
import { createPointerDown } from './on-pointer-down'
import { createPointerMove } from './on-pointer-move'
import { createPointerUp } from './on-pointer-up'
import type { Corner, FabCoords } from './types'

/**
 * Compute FAB position for a given corner.
 * @param c - Target corner
 * @returns Pixel coordinates
 */
export const fabPos = (c: Corner) =>
  cornerPosition(
    c,
    FAB_SIZE,
    FAB_MARGIN,
    globalThis.innerWidth,
    globalThis.innerHeight
  )

/**
 * Create pointer event handlers for FAB drag.
 * @param corner - Reactive corner ref
 * @param isDragging - Reactive dragging flag
 * @param dragPos - Reactive drag coordinates
 * @returns Pointer handlers and moved() getter
 */
export const createHandlers = (
  corner: Ref<Corner>,
  isDragging: Ref<boolean>,
  dragPos: Ref<FabCoords>
) => {
  const st = { sX: 0, sY: 0, moved: false }
  const p = () => fabPos(corner.value)
  return {
    moved: () => st.moved,
    down: createPointerDown(isDragging, dragPos, p, st),
    move: createPointerMove(isDragging, dragPos, p, st),
    up: createPointerUp(corner, isDragging, () => st.moved),
  }
}
