import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createLoad, createSave } from './features-actions'
import type { FeatureFlags } from './features-api'

/**
 * Pinia store backing the admin feature-flag editor. Flags live
 * in the content repo at `settings/features.json`; loading goes
 * through the SW git proxy and saving commits a new revision.
 * @returns Reactive state + load/save actions.
 */
export const useFeaturesStore = defineStore('features', () => {
  const flags = ref<FeatureFlags>({ webring: false })
  const sha = ref<string | undefined>(undefined)
  const loaded = ref(false)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | undefined>(undefined)
  const refs = { flags, sha, loaded, loading, saving, error }
  const load = createLoad(refs)
  const save = createSave(refs, load)
  const ensureLoaded = async (): Promise<void> => {
    await (loaded.value ? Promise.resolve() : load())
  }
  return {
    flags,
    sha,
    loaded,
    loading,
    saving,
    error,
    load,
    ensureLoaded,
    save,
  }
})
