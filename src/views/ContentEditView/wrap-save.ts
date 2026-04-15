import type { Ref } from 'vue'

const SAVED_HOLD_MS = 2000

/**
 * Wrap a save function with saving/saved state.
 *
 * Critical: the `saving` flag MUST always reset — before this wrapper
 * any error thrown by `rawSave()` left `saving = true` and froze the
 * editor (disabled save button forever, no way to retry without a
 * reload). A try/finally around the await guarantees the flag flips
 * back and propagates the original error to the caller so it can be
 * surfaced in ErrorMessage.
 * @param rawSave - Original save function
 * @param saving - Reactive saving flag
 * @param saved - Reactive saved flag
 * @returns Wrapped save handler
 */
export const wrapSave =
  (rawSave: () => Promise<void>, saving: Ref<boolean>, saved: Ref<boolean>) =>
  async (): Promise<void> => {
    saving.value = true
    saved.value = false
    try {
      await rawSave()
      saved.value = true
      setTimeout(() => {
        saved.value = false
      }, SAVED_HOLD_MS)
    } finally {
      saving.value = false
    }
  }
