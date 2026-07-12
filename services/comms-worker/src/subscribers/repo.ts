import { insertSubscriber } from './repo-insert'
import { findById, listActive, listAll } from './repo-read'
import { setStatus } from './repo-status'
import type { RepoDeps, SubscriberRepo } from './repo-types'
import {
  markSent,
  removeSubscriber,
  setLastSentAt,
  updateLangs,
  updateMessageLang,
} from './repo-write'

export type { RepoDeps, SubscriberRepo } from './repo-types'

/**
 * Build a subscriber repo bound to a D1 database + clock.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createRepo = (d: RepoDeps): SubscriberRepo => ({
  insert: async input =>
    insertSubscriber(d.db, d.now, {
      ...input,
      lastSentAt: input.lastSentAt ?? (await d.cutoffAt?.()),
    }),
  listActive: () => listActive(d.db),
  listAll: () => listAll(d.db),
  findById: id => findById(d.db, id),
  updateLangs: (id, langs) => updateLangs(d.db, id, langs),
  updateMessageLang: (id, lang) => updateMessageLang(d.db, id, lang),
  remove: id => removeSubscriber(d.db, id),
  setStatus: (id, status) => setStatus(d.db, d.now, id, status),
  markSent: (id, sentAt) => markSent(d.db, id, sentAt),
  setLastSentAt: (id, iso) => setLastSentAt(d.db, id, iso),
})
