import { beforeEach, describe, expect, it } from 'vitest'
import type { ResendClient, SendResult } from '../resend/types'
import type { Article } from '../rss/types'
import { createSendLogRepo, type SendLogRepo } from '../send-log/repo'
import { listTickSummaries } from '../send-log/ticks'
import { createSettingsRepo, type SettingsRepo } from '../settings/repo'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import type { Lang } from '../subscribers/types'
import { runDispatch } from './run'

/*
 * A tick that finds nothing new used to leave no trace at all: no
 * send_log rows, only a report emailed to the From address. From the
 * editor's side that is indistinguishable from a cron that stopped
 * firing — which is exactly how a month-long gap in the journal was
 * read. Such a tick now records itself, so the journal can say the
 * mailer ran and had nothing to carry.
 */

const TICK = new Date('2026-08-15T09:00:00.000Z')
const FROM = 'Communist Prometheus <newsletter@comprom.org>'

let db: ReturnType<typeof makeTestD1>
let subs: SubscriberRepo
let log: SendLogRepo
let settings: SettingsRepo

const resend = (): ResendClient => ({
  send: async (): Promise<SendResult> => ({ ok: true, id: 'r' }),
  sendBatch: async () => ({ ok: true, ids: ['r'] }),
})

const noArticles = async (): Promise<ReadonlyArray<Article>> => []
const noIssue = async (): Promise<Article | undefined> => undefined

const deps = () => ({
  subscriberRepo: subs,
  sendLogRepo: log,
  settingsRepo: settings,
  rss: (_l: Lang) => noArticles(),
  magazine: (_l: Lang) => noIssue(),
  resend: resend(),
  secret: 'shhh-secret-key-1234567890',
  fromAddress: FROM,
  publicBaseUrl: 'https://lists.comprom.org',
  tickAt: TICK,
})

beforeEach(() => {
  db = makeTestD1()
  subs = createRepo({ db, now: () => '2026-05-01T00:00:00.000Z' })
  log = createSendLogRepo({ db })
  settings = createSettingsRepo({ db })
})

describe('a tick that had nothing to send', () => {
  it('records that it ran, so the journal shows no silent gap', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await runDispatch(deps())
    const [run, ...rest] = await listTickSummaries(db, 10, 0)
    expect(rest).toEqual([])
    expect(run).toMatchObject({
      tickAt: TICK.toISOString(),
      recipients: 1,
      sent: 0,
      skipped: 1,
      articleCount: 0,
    })
  })

  it('marks the entry as belonging to no recipient', async () => {
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await runDispatch(deps())
    const rows = await log.listRecent(10)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.subscriberId).toBeUndefined()
  })

  it('records the same for a tick with no subscribers at all', async () => {
    await runDispatch(deps())
    const [run] = await listTickSummaries(db, 10, 0)
    expect(run).toMatchObject({ recipients: 1, skipped: 1 })
  })

  it('leaves the cutoff where it was — nothing was delivered', async () => {
    await settings.setCutoffAt('2026-08-08T09:00:19.000Z')
    await subs.insert({ email: 'a@b.c', langs: ['ru'] })
    await runDispatch(deps())
    expect(await settings.getCutoffAt()).toBe('2026-08-08T09:00:19.000Z')
  })
})
