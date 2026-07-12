import type { Lang } from '@/validation/schemas/subscriber'
import {
  apiRemoveSubscriber,
  apiUpdateLangs,
  apiUpdateLastSent,
  apiUpdateMessageLang,
} from './comms-api'

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
 * Build the `updateMessageLang` action that PATCHes one row + reloads.
 * @param load Loader used to refresh after the write.
 * @returns Async action returning void.
 */
export const createUpdateMessageLang =
  (load: () => Promise<void>) =>
  async (id: number, messageLang: Lang): Promise<void> => {
    await apiUpdateMessageLang(id, messageLang)
    await load()
  }

/**
 * Build the `updateLastSent` action that moves one address's watermark.
 * @param load Loader used to refresh after the write.
 * @returns Async action returning void.
 */
export const createUpdateLastSent =
  (load: () => Promise<void>) =>
  async (id: number, lastSentAt: string | null): Promise<void> => {
    await apiUpdateLastSent(id, lastSentAt)
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
