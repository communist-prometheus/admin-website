import type { Page, Route } from '@playwright/test'
import { createMockState, type MockState, mockHandlers } from './mock-state'

export type { MockState } from './mock-state'

const COMMS_PATTERN = '**/lists.comprom.org/api/**'
const SUB_BY_ID = /\/api\/subscribers\/(\d+)$/

type Handlers = ReturnType<typeof mockHandlers>
type FulfillBody = Parameters<Route['fulfill']>[0]
type Reply = FulfillBody | undefined
type Req = ReturnType<Route['request']>

const subscribersRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Req
): Reply => {
  if (!url.endsWith('/api/subscribers')) return undefined
  if (method === 'GET') return h.listSubs()
  if (method === 'POST') return h.postSubscriber(req.postDataJSON())
  return undefined
}

const scheduleRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Req
): Reply => {
  if (!url.endsWith('/api/schedule')) return undefined
  if (method === 'GET') return h.getSchedule()
  if (method === 'PUT') return h.putSchedule(req.postDataJSON())
  return undefined
}

const cutoffRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Req
): Reply => {
  if (!url.endsWith('/api/cutoff')) return undefined
  if (method === 'GET') return h.getCutoff()
  if (method === 'PUT') return h.putCutoff(req.postDataJSON())
  return undefined
}

const dispatchRoute = (url: string, method: string, h: Handlers): Reply => {
  if (url.endsWith('/api/dispatch?force=1') && method === 'POST')
    return h.forceDispatch()
  return undefined
}

const runsRoute = (url: string, method: string, h: Handlers): Reply =>
  url.includes('/api/runs') && method === 'GET' ? h.listRuns() : undefined

const collectionRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Req
): Reply =>
  subscribersRoute(url, method, h, req) ??
  scheduleRoute(url, method, h, req) ??
  cutoffRoute(url, method, h, req) ??
  runsRoute(url, method, h) ??
  dispatchRoute(url, method, h)

const itemRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Req
): Reply => {
  const m = SUB_BY_ID.exec(url)
  if (m === null) return undefined
  const id = Number(m[1])
  if (method === 'PATCH') {
    return h.patchSubscriber(id, req.postDataJSON().langs)
  }
  if (method === 'DELETE') {
    const r = h.deleteSubscriber(id)
    return { status: r.status, body: r.body }
  }
  return undefined
}

/**
 * Replay an HTTP intercept against the mock store.
 * @param state Mutable mock state shared across handlers.
 * @param route Playwright route intercept handle.
 */
const dispatch = async (state: MockState, route: Route): Promise<void> => {
  const handlers = mockHandlers(state)
  const req = route.request()
  const url = req.url()
  const method = req.method()
  const reply =
    collectionRoute(url, method, handlers, req) ??
    itemRoute(url, method, handlers, req)
  if (reply === undefined) {
    await route.fallback()
    return
  }
  await route.fulfill(reply)
}

/**
 * Install the comms-worker mock onto a Playwright page. Returns the
 * mock state so test scenes can also drive it directly.
 * @param page Playwright page handle.
 * @returns Mock state for direct manipulation.
 */
export const installCommsMocks = async (page: Page): Promise<MockState> => {
  const state = createMockState()
  await page.route(COMMS_PATTERN, route => dispatch(state, route))
  return state
}
