import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createLoad, createSave } from './cutoff-actions'

/**
 * Pinia store wrapping the global dispatch cutoff watermark. The
 * value is the ISO of the last successful tick (or whatever the
 * operator manually pinned). `null` = unset, no articles are
 * skipped.
 * @returns Reactive state + load/save actions.
 */
export const useCutoffStore = defineStore('cutoff', () => {
  const at = ref<string | null>(null)
  const loaded = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | undefined>(undefined)
  const refs = { at, loaded, loading, saving, error }
  const load = createLoad(refs)
  const save = createSave(refs)
  const ensureLoaded = async (): Promise<void> => {
    await (loaded.value ? Promise.resolve() : load())
  }
  return { at, loaded, loading, saving, error, load, ensureLoaded, save }
})
