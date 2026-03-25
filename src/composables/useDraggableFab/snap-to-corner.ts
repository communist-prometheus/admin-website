import type { Corner } from './types'

/**
 * Determine the nearest screen corner to a point.
 * @param x - Pointer X coordinate
 * @param y - Pointer Y coordinate
 * @param vw - Viewport width
 * @param vh - Viewport height
 * @returns Nearest corner identifier
 */
export const snapToCorner = (
  x: number,
  y: number,
  vw: number,
  vh: number
): Corner => {
  const isRight = x > vw / 2
  const isBottom = y > vh / 2
  const col = isRight ? 'right' : 'left'
  const row = isBottom ? 'bottom' : 'top'
  return `${row}-${col}`
}
