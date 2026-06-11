import type { Context } from 'hono'
import { createRepo, type SubscriberRepo } from '../subscribers/repo'
import type { UnsubscribeEnv } from './runtime-env'

const HTML_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
}

/** Repo + secret pair bound to the current request. */
export type RouteDeps = {
  readonly repo: SubscriberRepo
  readonly secret: string
}

/**
 * Build the subscriber repo + secret for the current request's D1.
 * @param c Hono context carrying UnsubscribeEnv bindings.
 * @returns Request-scoped repo and the shared unsubscribe secret.
 */
export const repoOf = (c: Context): RouteDeps => {
  const env = c.env as UnsubscribeEnv
  return {
    repo: createRepo({ db: env.DB, now: () => new Date().toISOString() }),
    secret: env.UNSUBSCRIBE_SECRET,
  }
}

/**
 * Wrap a rendered page into an HTML response.
 * @param body Full HTML document.
 * @param status HTTP status code.
 * @returns Response with the html content type.
 */
export const html = (body: string, status: number): Response =>
  new Response(body, { status, headers: HTML_HEADERS })
