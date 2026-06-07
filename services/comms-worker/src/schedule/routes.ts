import type { Context, Hono } from 'hono'
import type { SettingsRepo } from '../settings/repo'
import { handleGetSchedule, handlePutSchedule, type NowFn } from './handlers'

type App = Hono<{ Bindings: object; Variables: object }>
type Resolve = (c: Context) => SettingsRepo

/**
 * Mount the schedule endpoints on the given Hono app.
 * @param app Hono app, already wrapped with `requireSession` for /api/*.
 * @param resolve Builds the settings repo for the current request.
 * @param now Clock used to compute the `nextRunAt` field on the response.
 * @returns The same app for chaining.
 */
export const mountScheduleRoutes = (
  app: App,
  resolve: Resolve,
  now: NowFn
): App => {
  app.get('/api/schedule', c => handleGetSchedule(c, resolve(c), now))
  app.put('/api/schedule', c => handlePutSchedule(c, resolve(c), now))
  return app
}
