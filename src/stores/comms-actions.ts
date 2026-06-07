import type { Ref } from 'vue'
import type { Lang, Subscriber } from '@/validation/schemas/subscriber'
import {
  apiAddSubscriber,
  apiListSubscribers,
  apiRemoveSubscriber,
  apiUpdateLangs,
} from './comms-api'

/** Mutable refs the action factories read + write. */
export type CommsRefs = {
  readonly subscribers: Ref<readonly Subscriber[]>
  readonly loading: Ref<boolean>
  readonly loaded: Ref<boolean>
  readonly saving: Ref<boolean>
}

/**
 * Build the `load` action that refreshes `subscribers` from the worker.
 * @param r Reactive refs the action mutates.
 * @returns Async action returning void.
 */
export const createLoad = (r: CommsRefs) => async (): Promise<void> => {
  r.loading.value = true
  try {
    const res = await apiListSubscribers()
    r.subscribers.value = Object.freeze([...res.subscribers])
    r.loaded.value = true
  } finally {
    r.loading.value = false
  }
}

/**
 * Build the `add` action that POSTs a new subscriber + reloads.
 * @param r Reactive refs the action mutates.
 * @param load Loader used to refresh after the write.
 * @returns Async action returning void.
 */
export const createAdd =
  (r: CommsRefs, load: () => Promise<void>) =>
  async (email: string, langs: readonly Lang[]): Promise<void> => {
    r.saving.value = true
    try {
      await apiAddSubscriber(email, langs)
      await load()
    } finally {
      r.saving.value = false
    }
  }

/**
 * Build the `updateLangs` action that PATCHes one row + reloads.
 * @param load Loader used to refresh after the write.
 * @returns Async action returning void.
 */
export const createUpdateLangs =
  (load: () => Promise<void>) =>
  async (id: number, langs: readonly Lang[]): Promise<void> => {
    await apiUpdateLangs(id, langs)
    await load()
  }

/**
 * Build the `remove` action that DELETEs one row + reloads.
 * @param load Loader used to refresh after the write.
 * @returns Async action returning void.
 */
export const createRemove =
  (load: () => Promise<void>) =>
  async (id: number): Promise<void> => {
    await apiRemoveSubscriber(id)
    await load()
  }
