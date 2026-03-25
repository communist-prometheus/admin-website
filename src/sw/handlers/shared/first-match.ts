import { Effect, Option, pipe } from 'effect'

/** Route handler that may or may not match a request. */
export type RouteHandler = (
  url: URL,
  request: Request
) => Promise<Response | undefined>

/**
 * Wrap an async route handler as an Effect yielding Option.
 * @param handler - Async route function
 * @param url - Parsed request URL
 * @param request - Original request
 * @returns Effect yielding Some(Response) or None
 */
const tryRoute = (
  handler: RouteHandler,
  url: URL,
  request: Request
): Effect.Effect<Option.Option<Response>, unknown> =>
  pipe(
    Effect.tryPromise(() => handler(url, request)),
    Effect.map(Option.fromNullable)
  )

/**
 * Try each route in order, return first matching Response.
 * @param handlers - Ordered array of route handlers
 * @param url - Parsed request URL
 * @param request - Original request
 * @returns Effect yielding Some(Response) or None
 */
export const firstMatch = (
  handlers: readonly RouteHandler[],
  url: URL,
  request: Request
): Effect.Effect<Option.Option<Response>, unknown> =>
  pipe(
    handlers,
    Effect.reduce(Option.none<Response>(), (found, handler) =>
      Option.isSome(found)
        ? Effect.succeed(found)
        : tryRoute(handler, url, request)
    )
  )
