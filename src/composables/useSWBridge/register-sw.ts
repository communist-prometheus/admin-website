import { Effect, Option } from 'effect'
import { swContainer, swScriptExists } from './check-sw-available'
import { log as swLog } from './sw-log'

const logSync = (
  level: 'info' | 'warn' | 'error',
  msg: string,
  data?: Record<string, unknown>
) => Effect.sync(() => swLog(level, msg, data))

/**
 * Wire up listeners that detect when a new SW activates and reload
 * the page so the client code always matches the running SW.
 * Also proactively checks for updates when the tab regains focus.
 * @param reg - ServiceWorkerRegistration to monitor
 */
const wireUpdateLifecycle = (reg: ServiceWorkerRegistration): void => {
  reg.addEventListener('updatefound', () => {
    const installing = reg.installing
    if (!installing) return
    swLog('info', 'New SW version found, waiting for activation')
    installing.addEventListener('statechange', () => {
      if (installing.state === 'activated') {
        swLog('info', 'New SW activated — reloading page')
        globalThis.location.reload()
      }
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    swLog('info', 'SW controller changed — reloading page')
    globalThis.location.reload()
  })

  globalThis.document?.addEventListener('visibilitychange', () => {
    if (!globalThis.document.hidden) {
      void reg.update().catch(() => {
        /* silent — network may be offline */
      })
    }
  })
}

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
