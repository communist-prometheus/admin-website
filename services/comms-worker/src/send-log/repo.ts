import type { D1Database } from '@cloudflare/workers-types'
import { listByTickWithEmail } from './by-tick'
import {
  append,
  findByResendId,
  listRecent,
  purgeOlderThan,
} from './repo-impl'
import type { NewSendLog, SendLog } from './types'
import type { SendLogWithEmail } from './with-email'

/** Repo facade for the `send_log` table. */
export type SendLogRepo = {
  readonly append: (row: NewSendLog) => Promise<void>
  readonly listRecent: (limit: number) => Promise<ReadonlyArray<SendLog>>
  readonly listByTick: (
    tickAt: string
  ) => Promise<ReadonlyArray<SendLogWithEmail>>
  readonly purgeOlderThan: (cutoffIsoUtc: string) => Promise<number>
  readonly findByResendId: (resendId: string) => Promise<SendLog | undefined>
}

type Deps = { readonly db: D1Database }

/**
 * Build a `send_log` repo bound to the given D1 database.
 * @param d Injected dependencies.
 * @returns Repo facade.
 */
export const createSendLogRepo = (d: Deps): SendLogRepo => ({
  append: row => append(d.db, row),
  listRecent: limit => listRecent(d.db, limit),
  listByTick: tickAt => listByTickWithEmail(d.db, tickAt),
  purgeOlderThan: cutoff => purgeOlderThan(d.db, cutoff),
  findByResendId: resendId => findByResendId(d.db, resendId),
})
