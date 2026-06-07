import type { Ref } from 'vue'
import { apiGetCutoff, apiPutCutoff } from './cutoff-api'

/** Refs shared between the store and its action factories. */
export type CutoffRefs = {
  readonly at: Ref<string | null>
  readonly loaded: Ref<boolean>
  readonly loading: Ref<boolean>
  readonly saving: Ref<boolean>
  readonly error: Ref<string | undefined>
}

/**
 * Build the `load` action: fetches the current cutoff and pushes it
 * into the shared refs. Errors are reported on `r.error` instead of
 * being thrown, mirroring the rest of the comms stores.
 * @param r Shared refs.
 * @returns Async loader.
 */
export const createLoad = (r: CutoffRefs) => async (): Promise<void> => {
  r.loading.value = true
  r.error.value = undefined
  try {
    const next = await apiGetCutoff()
    r.at.value = next.at
    r.loaded.value = true
  } catch (e) {
    r.error.value = e instanceof Error ? e.message : 'Failed to load cutoff'
  } finally {
    r.loading.value = false
  }
}

/**
 * Build the `save` action: persists a new cutoff (or `null` to
 * clear) and updates the refs with whatever the worker echoed back.
 * @param r Shared refs.
 * @returns Async setter taking the new ISO or null.
 */
export const createSave =
  (r: CutoffRefs) =>
  async (next: string | null): Promise<void> => {
    r.saving.value = true
    r.error.value = undefined
    try {
      const echoed = await apiPutCutoff(next)
      r.at.value = echoed.at
    } catch (e) {
      r.error.value = e instanceof Error ? e.message : 'Failed to save cutoff'
    } finally {
      r.saving.value = false
    }
  }
