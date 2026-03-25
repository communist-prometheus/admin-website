import type { CSSProperties } from 'vue'

/**
 * Compute overlay visibility styles.
 * @param open - Whether overlay is visible
 * @returns CSS properties for the overlay
 */
export const overlayStyle = (open: boolean): CSSProperties =>
  open
    ? { opacity: 1, transform: 'scale(1)', pointerEvents: 'auto' }
    : {
        opacity: 0,
        transform: 'scale(0.95)',
        pointerEvents: 'none',
      }
