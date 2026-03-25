import type { CSSProperties } from 'vue'

/** Base style for a single hamburger line. */
const baseLine: CSSProperties = {
  display: 'block',
  width: '24px',
  height: '2px',
  background: 'var(--color-text-primary)',
  borderRadius: '1px',
  transition: 'all var(--transition-base)',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
}

/**
 * Compute style for each hamburger line.
 * @param index - Line index (0, 1, or 2)
 * @param open - Whether menu is open
 * @returns CSS properties for the line
 */
export const lineStyle = (index: number, open: boolean): CSSProperties => {
  if (index === 0) {
    return open
      ? {
          ...baseLine,
          top: '50%',
          transform: 'translate(-50%) rotate(45deg)',
        }
      : { ...baseLine, top: '35%' }
  }
  if (index === 1) {
    return open
      ? { ...baseLine, opacity: 0 }
      : { ...baseLine, top: '50%', transform: 'translate(-50%, -50%)' }
  }
  return open
    ? { ...baseLine, top: '50%', transform: 'translate(-50%) rotate(-45deg)' }
    : { ...baseLine, bottom: '35%' }
}
