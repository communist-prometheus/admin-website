import type { Ref } from 'vue'

/**
 * Wrap a save function with saving/saved state.
 * @param rawSave - Original save function
 * @param saving - Reactive saving flag
 * @param saved - Reactive saved flag
 * @returns Wrapped save handler
 */
export const wrapSave =
  (rawSave: () => Promise<void>, saving: Ref<boolean>, saved: Ref<boolean>) =>
  async () => {
    saving.value = true
    saved.value = false
    await rawSave()
    saving.value = false
    saved.value = true
    setTimeout(() => {
      saved.value = false
    }, 2000)
  }
