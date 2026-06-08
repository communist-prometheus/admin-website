import type { Ref } from 'vue'
import {
  type FeatureFlags,
  fetchFeaturesFile,
  parseFeatures,
  saveFeaturesFile,
} from './features-api'
import { ensureOk, messageOf } from './features-helpers'

const DEFAULTS: FeatureFlags = { webring: false }

/** Refs shared between the features store and its action factories. */
export type FeaturesRefs = {
  readonly flags: Ref<FeatureFlags>
  readonly sha: Ref<string | undefined>
  readonly loaded: Ref<boolean>
  readonly loading: Ref<boolean>
  readonly saving: Ref<boolean>
  readonly error: Ref<string | undefined>
}

/**
 * Build the `load` action — fetches `features.json` and pushes it
 * into the shared refs. Errors land on `r.error`.
 * @param r Shared refs.
 * @returns Async loader.
 */
export const createLoad = (r: FeaturesRefs) => async (): Promise<void> => {
  r.loading.value = true
  r.error.value = undefined
  try {
    const file = await fetchFeaturesFile()
    r.flags.value =
      file === undefined ? DEFAULTS : parseFeatures(file.content)
    r.sha.value = file?.sha
    r.loaded.value = true
  } catch (e) {
    r.error.value = messageOf(e, 'Failed to load features')
  } finally {
    r.loading.value = false
  }
}

/**
 * Build the `save` action — commits a new flag bundle then reloads.
 * @param r Shared refs.
 * @param reload Loader to re-pull the file after the commit.
 * @returns Async setter.
 */
export const createSave =
  (r: FeaturesRefs, reload: () => Promise<void>) =>
  async (next: FeatureFlags): Promise<void> => {
    r.saving.value = true
    r.error.value = undefined
    try {
      ensureOk(await saveFeaturesFile(next, r.sha.value))
      r.flags.value = next
      await reload()
    } catch (e) {
      r.error.value = messageOf(e, 'Failed to save features')
    } finally {
      r.saving.value = false
    }
  }
