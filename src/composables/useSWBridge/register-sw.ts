import { Effect, Option } from 'effect'
import { swContainer, swScriptExists } from './check-sw-available'
import { log as swLog } from './sw-log'
import { wireUpdateLifecycle } from './sw-update-lifecycle'

const logSync = (
  level: 'info' | 'warn' | 'error',
  msg: string,
  data?: Record<string, unknown>
) => Effect.sync(() => swLog(level, msg, data))

const doRegister: Effect.Effect<
  ServiceWorkerRegistration | undefined,
  never
> = Effect.tryPromise({
  try: () => navigator.serviceWorker.register('/sw.js'),
  catch: e => e,
}).pipe(
  Effect.tap(r => {
    wireUpdateLifecycle(r)
    return logSync('info', 'SW registered', { scope: r.scope })
  }),
  Effect.catchAll(e => {
    swLog('error', 'SW registration failed', { error: e })
    return Effect.succeed(undefined)
  })
)

const skipLog = (msg: string) =>
  Effect.sync<undefined>(() => {
    swLog('warn', msg)
    return undefined
  })

/**
 * Register the Service Worker and wire update lifecycle.
 * Skips registration in dev when sw.js is not built.
 * @returns The ServiceWorkerRegistration, or undefined
 */
export const registerServiceWorker = async (): Promise<
  ServiceWorkerRegistration | undefined
> =>
  Effect.runPromise(
    Option.match(swContainer(), {
      onNone: () => skipLog('ServiceWorker not supported'),
      onSome: () =>
        swScriptExists.pipe(
          Effect.flatMap(exists =>
            exists
              ? doRegister
              : skipLog('sw.js not found, skipping registration')
          )
        ),
    })
  )
