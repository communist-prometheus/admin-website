/**
 * Whether the viewer can render this file inline. Iteration-2 scope is
 * raster + vector images; everything else falls back to the
 * pictogram + download panel.
 * @param mimeType - File MIME type
 * @returns True when the viewer displays the file directly
 */
export const isViewable = (mimeType: string): boolean =>
  mimeType.startsWith('image/')

/**
 * Clamp an index into the valid range of a list (no wrap).
 * @param index - Desired index
 * @param length - List length
 * @returns Index within [0, length - 1], or 0 for an empty list
 */
export const clampIndex = (index: number, length: number): number =>
  length === 0 ? 0 : Math.max(0, Math.min(index, length - 1))

/**
 * Move from `index` by `step`, clamped to the list (ends do not wrap).
 * @param index - Current index
 * @param step - Signed step (e.g. -1 previous, +1 next)
 * @param length - List length
 * @returns New clamped index
 */
export const moveIndex = (
  index: number,
  step: number,
  length: number
): number => clampIndex(index + step, length)

/**
 * Translate a horizontal pointer delta into a navigation step. A
 * left-swipe (negative delta) advances; a right-swipe retreats. Deltas
 * within the threshold do not navigate.
 * @param deltaX - Pointer displacement (end minus start), px
 * @param threshold - Minimum absolute displacement to count, px
 * @returns +1 next, -1 previous, 0 none
 */
export const swipeStep = (deltaX: number, threshold: number): number =>
  deltaX <= -threshold ? 1 : deltaX >= threshold ? -1 : 0
