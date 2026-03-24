import { workerState } from '../../state/state'

/**
 * Get content base path, joining contentPath with type.
 * Handles empty contentPath (content at repo root).
 * @param type - Content type (blog, pages, positions)
 * @returns Path prefix for file listing
 */
export const contentBase = (type: string): string => {
  const cp = workerState.config?.contentPath ?? ''
  return cp ? `${cp}/${type}` : type
}
