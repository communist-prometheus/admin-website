import type { Route } from '@playwright/test'

type Subscriber = {
  readonly id: number
  readonly email: string
  readonly langs: readonly string[]
  readonly status: 'active' | 'unsubscribed' | 'bounced' | 'complained'
  readonly createdAt: string
  readonly lastSentAt: string | undefined
  readonly unsubscribedAt: string | undefined
}

type RunRow = {
  readonly id: number
  readonly subscriberId: number | undefined
  readonly tickAt: string
  readonly articleCount: number
  readonly status: 'sent' | 'failed' | 'bounced' | 'complained' | 'skipped'
  readonly resendId: string | undefined
  readonly error: string | undefined
  readonly email: string | undefined
}

const seed: Subscriber[] = [
  {
    id: 1,
    email: 'editorial@example.test',
    langs: ['ru', 'en'],
    status: 'active',
    createdAt: '2026-05-21T10:15:00.000Z',
    lastSentAt: '2026-06-04T09:00:00.000Z',
    unsubscribedAt: undefined,
  },
  {
    id: 2,
    email: 'reader-it@example.test',
    langs: ['it'],
    status: 'active',
    createdAt: '2026-05-25T18:42:00.000Z',
    lastSentAt: undefined,
    unsubscribedAt: undefined,
  },
  {
    id: 3,
    email: 'lapsed-pl@example.test',
    langs: ['pl'],
    status: 'unsubscribed',
    createdAt: '2026-04-10T08:30:00.000Z',
    lastSentAt: '2026-05-28T12:00:00.000Z',
    unsubscribedAt: '2026-05-29T20:11:00.000Z',
  },
]

const seedRuns: RunRow[] = [
  {
    id: 11,
    subscriberId: 1,
    tickAt: '2026-06-04T09:00:00.000Z',
    articleCount: 3,
    status: 'sent',
    resendId: 're_demo_1',
    error: undefined,
    email: 'editorial@example.test',
  },
  {
    id: 12,
    subscriberId: 2,
    tickAt: '2026-06-04T09:00:00.000Z',
    articleCount: 2,
    status: 'sent',
    resendId: 're_demo_2',
    error: undefined,
    email: 'reader-it@example.test',
  },
]

/** Live mock state mutated by every intercept call. */
export type MockState = {
  subscribers: Subscriber[]
  schedule: { cron: string; timezone: string; nextRunAt: string }
  cutoffAt: string | null
  runs: RunRow[]
  nextId: number
  nextRunId: number
}

const computeNextRun = (cron: string): string =>
  cron === '0 9 * * 1'
    ? '2026-06-08T06:00:00.000Z'
    : cron === '0 12 * * 6'
      ? '2026-06-06T09:00:00.000Z'
      : '2026-06-07T00:00:00.000Z'

/** Build a fresh stateful mock store for one walkthrough run. */
export const createMockState = (): MockState => ({
  subscribers: seed.map(s => ({ ...s, langs: [...s.langs] })),
  schedule: {
    cron: '0 12 * * 6',
    timezone: 'Europe/Moscow',
    nextRunAt: '2026-06-06T09:00:00.000Z',
  },
  cutoffAt: null,
  runs: seedRuns.map(r => ({ ...r })),
  nextId: 4,
  nextRunId: 14,
})

const json = (
  body: unknown,
  status = 200
): Parameters<Route['fulfill']>[0] => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(body),
})

/** Handlers wired in `page.route` — see `scenario.spec.ts`. */
export const mockHandlers = (s: MockState) => ({
  listSubs: () => json({ subscribers: s.subscribers }),
  getSchedule: () => json(s.schedule),
  listRuns: () => json({ runs: s.runs }),
  postSubscriber: (body: { email: string; langs: string[] }) => {
    const row: Subscriber = {
      id: s.nextId++,
      email: body.email,
      langs: body.langs,
      status: 'active',
      createdAt: '2026-06-06T09:00:00.000Z',
      lastSentAt: undefined,
      unsubscribedAt: undefined,
    }
    s.subscribers = [...s.subscribers, row]
    return json(row, 201)
  },
  patchSubscriber: (id: number, langs: string[]) => {
    s.subscribers = s.subscribers.map(r =>
      r.id === id ? { ...r, langs } : r
    )
    const updated = s.subscribers.find(r => r.id === id)
    return updated === undefined
      ? json({ error: 'not_found' }, 404)
      : json(updated)
  },
  deleteSubscriber: (id: number) => {
    s.subscribers = s.subscribers.filter(r => r.id !== id)
    return { status: 204, body: '' }
  },
  putSchedule: (body: { cron: string; timezone: string }) => {
    s.schedule = {
      cron: body.cron,
      timezone: body.timezone,
      nextRunAt: computeNextRun(body.cron),
    }
    return json(s.schedule)
  },
  getCutoff: () => json({ at: s.cutoffAt }),
  putCutoff: (body: { at: string | null }) => {
    s.cutoffAt = body.at
    return json({ at: s.cutoffAt })
  },
  /** Simulate a force-dispatch by appending a fresh "sent" row. */
  forceDispatch: () => {
    const target = s.subscribers.find(r => r.status === 'active')
    if (target !== undefined) {
      s.runs = [
        {
          id: s.nextRunId++,
          subscriberId: target.id,
          tickAt: '2026-06-06T09:05:00.000Z',
          articleCount: 4,
          status: 'sent',
          resendId: `re_demo_${s.nextRunId}`,
          error: undefined,
          email: target.email,
        },
        ...s.runs,
      ]
    }
    return json({ sent: 1, failed: 0, skipped: 0, durationMs: 412 }, 202)
  },
})
