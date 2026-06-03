import type { D1Database } from '@cloudflare/workers-types'
import { insertSubscriber } from './repo-insert'
import { findById, listActive, listAll } from './repo-read'
import { removeSubscriber, setStatus, updateLangs } from './repo-write'
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
  readonly remove: (id: number) => Promise<boolean>
  readonly setStatus: (
    id: number,
    status: SubscriberStatus
  ) => Promise<Subscriber | undefined>
}

type Deps = { readonly db: D1Database; readonly now: () => string }

/**
 * Build a subscriber repo bound to a D1 database + clock.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createRepo = (d: Deps): SubscriberRepo => ({
  insert: input => insertSubscriber(d.db, d.now, input),
  listActive: () => listActive(d.db),
  listAll: () => listAll(d.db),
  findById: id => findById(d.db, id),
  updateLangs: (id, langs) => updateLangs(d.db, id, langs),
  remove: id => removeSubscriber(d.db, id),
  setStatus: (id, status) => setStatus(d.db, d.now, id, status),
})
