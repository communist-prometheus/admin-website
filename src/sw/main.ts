/**
 * Service Worker entry point.
 * Buffer polyfill and isomorphic-git are lazy-loaded
 * via load-git.ts to enable code-splitting. This keeps
 * the main SW chunk small for fast installation.
 */
import { registerFetchListener } from './fetch-listener'
import { registerLifecycle } from './lifecycle'
import { initLogChannel, log } from './logging/logger'
import { registerMessageListener } from './message-listener'
import { SW_VERSION } from './protocol'

initLogChannel()
log('info', 'lifecycle', 'SW loading', { version: SW_VERSION })

registerLifecycle()
registerFetchListener()
registerMessageListener()

log('info', 'lifecycle', 'SW ready', { version: SW_VERSION })
