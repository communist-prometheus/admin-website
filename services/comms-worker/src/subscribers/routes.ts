import type { Context, Hono } from 'hono'
import type { SubscriberRepo } from './repo'
import { handleCreate, handleDelete, handlePatch } from './route-handlers'

type App = Hono<{ Bindings: object; Variables: object }>
type Resolve = (c: Context) => SubscriberRepo

/**
 * Mount the subscriber CRUD endpoints on the given Hono app.
 * @param app Hono app, already wrapped with `requireSession` for /api/*.
 * @param resolve Builds the repo for the current request from its context.
 * @returns The same app for chaining.
 */
export const mountSubscriberRoutes = (app: App, resolve: Resolve): App => {
  app.get('/api/subscribers', async c =>
    c.json({ subscribers: await resolve(c).listAll() })
  )
  app.post('/api/subscribers', c => handleCreate(c, resolve(c)))
  app.patch('/api/subscribers/:id', c => handlePatch(c, resolve(c)))
  app.delete('/api/subscribers/:id', c => handleDelete(c, resolve(c)))
  return app
}
