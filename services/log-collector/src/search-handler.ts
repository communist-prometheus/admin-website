import type { Context, Hono } from 'hono'
import type { AuthVariables } from './auth-middleware'
import { parseSearchQuery } from './search-query'
import { searchTraces } from './search-traces'
import type { StorageBindings } from './storage-types'

/** Bindings the search handler reads off the worker env. */
export type SearchBindings = StorageBindings

const runSearch = async (
  c: Context<{ Bindings: SearchBindings; Variables: AuthVariables }>
): Promise<Response> => {
  const url = new URL(c.req.url)
  const query = parseSearchQuery(url.searchParams)
  const result = await searchTraces(c.env, query)
  return c.json(result)
}

/**
 * Wire `GET /v1/traces`. Auth + rate-limit middlewares run
 * upstream. The handler returns paginated trace summaries with
 * a cursor for the next page.
 * @param app Hono app to extend.
 * @returns Same app for chaining.
 */
export const registerSearchRoute = (
  app: Hono<{ Bindings: SearchBindings; Variables: AuthVariables }>
): Hono<{ Bindings: SearchBindings; Variables: AuthVariables }> => {
  app.get('/v1/traces', runSearch)
  return app
}
