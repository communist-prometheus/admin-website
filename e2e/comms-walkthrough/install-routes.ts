import type { Page, Route } from '@playwright/test'
import { createMockState, type MockState, mockHandlers } from './mock-state'

export type { MockState } from './mock-state'

const COMMS_PATTERN = '**/lists.comprom.org/api/**'
const SUB_BY_ID = /\/api\/subscribers\/(\d+)$/

type Handlers = ReturnType<typeof mockHandlers>
type FulfillBody = Parameters<Route['fulfill']>[0]
type Reply = FulfillBody | undefined

const collectionRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: Route['request'] extends () => infer R ? R : never
): Reply => {
  if (url.endsWith('/api/subscribers') && method === 'GET')
    return h.listSubs()
  if (url.endsWith('/api/subscribers') && method === 'POST') {
    return h.postSubscriber(req.postDataJSON())
  }
  if (url.endsWith('/api/schedule') && method === 'GET')
    return h.getSchedule()
  if (url.endsWith('/api/schedule') && method === 'PUT') {
    return h.putSchedule(req.postDataJSON())
  }
  if (url.includes('/api/runs') && method === 'GET') return h.listRuns()
  if (url.endsWith('/api/dispatch?force=1') && method === 'POST') {
    return h.forceDispatch()
  }
  return undefined
}

const itemRoute = (
  url: string,
  method: string,
  h: Handlers,
  req: ReturnType<Route['request']>
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
