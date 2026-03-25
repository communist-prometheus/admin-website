import type { Corner } from './types'

const KEY = 'fab-corner'
const DEFAULT: Corner = 'bottom-right'
const isCorner = (v: string): v is Corner =>
  v === 'top-left' ||
  v === 'top-right' ||
  v === 'bottom-left' ||
  v === 'bottom-right'

/**
 * Load persisted FAB corner from localStorage.
 * @returns Saved corner or 'bottom-right'
 */
export const loadCorner = (): Corner => {
  const v = localStorage.getItem(KEY)
  return v && isCorner(v) ? v : DEFAULT
}

/**
 * Save FAB corner to localStorage.
 * @param corner - Corner to persist
 */
export const saveCorner = (corner: Corner): void => {
  localStorage.setItem(KEY, corner)
}
