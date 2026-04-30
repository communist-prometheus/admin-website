/**
 * Service Worker entry point.
 * Buffer polyfill and isomorphic-git are lazy-loaded
 * via load-git.ts to enable code-splitting. This keeps
 * the main SW chunk small for fast installation.
 */
import { registerConnectivityListener } from './connectivity/sw-connectivity-state'
import { registerFetchListener } from './core/fetch-listener'
import { registerLifecycle } from './core/lifecycle'
import { registerMessageListener } from './core/messaging/message-listener'
import { initLogChannel, log } from './logging/logger'
import { SW_VERSION } from './protocol'
import { registerPushControlListener } from './push-queue/control-listener'

initLogChannel()
log('info', 'lifecycle', 'SW loading', { version: SW_VERSION })

registerLifecycle()
registerFetchListener()
registerMessageListener()
registerPushControlListener()
registerConnectivityListener()

log('info', 'lifecycle', 'SW ready', { version: SW_VERSION })
