import { describe, expect, it } from 'vitest'
import { createResendClient } from '../resend/client'
import type { Article } from '../rss/types'
import { createSendLogRepo } from '../send-log/repo'
import { createSettingsRepo } from '../settings/repo'
import { createRepo } from '../subscribers/repo'
import { makeTestD1 } from '../subscribers/test-d1'
import type { Lang } from '../subscribers/types'
import { runDispatch } from './run'
import type { RunDispatchDeps } from './types'

/*
 * 2026-09-12 and 2026-10-03: the first chunk of the production dispatch
 * answered 409 until the retry budget ran out, while every later chunk of
 * the same size went straight through.
 *
 * The production and the develop workers share one Resend account, fire
 * on the same hourly cron and so receive the same `scheduledTime`. Both
 * built the key `digest:<tick>:<chunk>`, and the develop worker — one
 * subscriber, one chunk — claimed `…:0` first. Resend then refused the
 * production chunk 0 as `invalid_idempotent_request`: a key it had
 * already seen, carrying a different payload. No amount of waiting
 * settles that, and nothing was sent.
 */

const TICK = new Date('2026-10-03T09:00:16.000Z')
const FROM = 'Communist Prometheus <newsletter@comprom.org>'
const BATCH_URL = 'https://api.resend.com/emails/batch'

const article = (guid: string): Article => ({
  guid,
  title: guid,
  link: `https://x/${guid}`,
  lang: 'ru',
  pubDate: '2026-10-02T00:00:00.000Z',
})

const json = (body: unknown, status: number): Response =>
  new Response(JSON.stringify(body), { status })

/**
 * One Resend account as two workers see it: a key is remembered together
 * with the payload it first carried, replayed for the same payload and
 * refused for a different one.
 */
const resendAccount = (): typeof fetch => {
  const seen = new Map<string, string>()
  return async (input, init) => {
    if (String(input) !== BATCH_URL) return json({ id: 're_report' }, 200)
    const key = new Headers(init?.headers).get('Idempotency-Key') ?? ''
    const body = String(init?.body)
    const first = seen.get(key) ?? body
    seen.set(key, first)
    if (first !== body)
      return json(
        { name: 'invalid_idempotent_request', statusCode: 409 },
        409
      )
    const emails: ReadonlyArray<unknown> = JSON.parse(body)
    return json({ data: emails.map((_, i) => ({ id: `re_${i}` })) }, 200)
  }
}

/** One worker deployment: its own database, the shared Resend account. */
const deployment = async (
  account: typeof fetch,
  emails: ReadonlyArray<string>
) => {
  const db = makeTestD1()
  const subscriberRepo = createRepo({
    db,
    now: () => '2026-05-01T00:00:00.000Z',
  })
  const settingsRepo = createSettingsRepo({ db })
  await settingsRepo.setCutoffAt('2026-09-26T09:00:00.000Z')
  for (const email of emails)
    await subscriberRepo.insert({ email, langs: ['ru'] })
  const sendLogRepo = createSendLogRepo({ db })
  const deps: RunDispatchDeps = {
    subscriberRepo,
    sendLogRepo,
    settingsRepo,
    rss: async (_l: Lang): Promise<ReadonlyArray<Article>> => [article('a')],
    magazine: async (_l: Lang): Promise<Article | undefined> => undefined,
    resend: createResendClient({
      apiKey: 'rk_shared',
      fetch: account,
      sleep: async () => undefined,
    }),
    secret: 'shhh-secret-key-1234567890',
    fromAddress: FROM,
    publicBaseUrl: 'https://lists.comprom.org',
    tickAt: TICK,
  }
  return { deps, sendLogRepo }
}

describe('two deployments sharing one Resend account on the same tick', () => {
  it('delivers both dispatches, whichever reaches Resend first', async () => {
    const account = resendAccount()
    const develop = await deployment(account, ['tester@x.t'])
    const production = await deployment(account, ['a@x.t', 'b@x.t', 'c@x.t'])

    const first = await runDispatch(develop.deps)
    const second = await runDispatch(production.deps)

    expect(first).toMatchObject({ sent: 1, failed: 0, unresolved: 0 })
    expect(second).toMatchObject({ sent: 3, failed: 0, unresolved: 0 })
    const rows = await production.sendLogRepo.listRecent(20)
    expect(rows.map(r => r.status)).toEqual(['sent', 'sent', 'sent'])
  })
})
