import type { D1Database } from '@cloudflare/workers-types'
import type {
  Lang,
  NewSubscriber,
  Subscriber,
  SubscriberStatus,
} from './types'

/** Aggregated subscriber-repo surface used by Hono handlers. */
export type SubscriberRepo = {
  readonly insert: (input: NewSubscriber) => Promise<Subscriber>
  readonly listActive: () => Promise<ReadonlyArray<Subscriber>>
  readonly listAll: () => Promise<ReadonlyArray<Subscriber>>
  readonly findById: (id: number) => Promise<Subscriber | undefined>
  readonly updateLangs: (
    id: number,
    langs: ReadonlyArray<Lang>
  ) => Promise<Subscriber | undefined>
  readonly updateMessageLang: (
    id: number,
    messageLang: Lang
  ) => Promise<Subscriber | undefined>
  readonly remove: (id: number) => Promise<boolean>
  readonly setStatus: (
    id: number,
    status: SubscriberStatus
  ) => Promise<Subscriber | undefined>
  readonly markSent: (id: number, sentAtIso: string) => Promise<void>
  readonly setLastSentAt: (
    id: number,
    iso: string | undefined
  ) => Promise<Subscriber | undefined>
}

/** Dependencies a {@link SubscriberRepo} is built from. */
export type RepoDeps = {
  readonly db: D1Database
  readonly now: () => string
  /*
   * Seed for a new address's watermark. Wired to `settings.cutoff_at` in
   * production so a new subscriber starts level with the list instead of
   * being mailed everything published since the list's last run.
   */
  readonly cutoffAt?: () => Promise<string | undefined>
}
