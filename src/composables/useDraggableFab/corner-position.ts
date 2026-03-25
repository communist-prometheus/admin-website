import type { Corner, FabCoords } from './types'

/**
 * Compute pixel position for a given corner.
 * @param corner - Target corner
 * @param size - FAB button size in px
 * @param margin - Edge margin in px
 * @param vw - Viewport width
 * @param vh - Viewport height
 * @returns Pixel coordinates {x, y}
 */
export const cornerPosition = (
  corner: Corner,
  size: number,
  margin: number,
  vw: number,
  vh: number
): FabCoords => {
  const right = vw - size - margin
  const bottom = vh - size - margin
  const coords: Record<Corner, FabCoords> = {
    'top-left': { x: margin, y: margin },
    'top-right': { x: right, y: margin },
    'bottom-left': { x: margin, y: bottom },
    'bottom-right': { x: right, y: bottom },
  }
  return coords[corner]
}
