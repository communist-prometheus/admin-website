import type { Ref } from 'vue'
import { saveCorner } from './persist-corner'
import { snapToCorner } from './snap-to-corner'
import type { Corner } from './types'

/**
 * Create pointerup handler that snaps FAB to corner.
 * @param corner - Reactive corner ref
 * @param isDragging - Reactive dragging flag
 * @param wasMoved - Getter for whether drag occurred
 * @returns PointerEvent handler
 */
export const createPointerUp =
  (corner: Ref<Corner>, isDragging: Ref<boolean>, wasMoved: () => boolean) =>
  (e: PointerEvent) => {
    isDragging.value = false
    if (!wasMoved()) return
    const vw = globalThis.innerWidth
    const vh = globalThis.innerHeight
    corner.value = snapToCorner(e.clientX, e.clientY, vw, vh)
    saveCorner(corner.value)
  }
