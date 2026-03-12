/**
 * Service Worker entry point.
 * Polyfill Buffer for CJS libs (isomorphic-git deps) that expect
 * Node.js Buffer global. Must be set before any git operations.
 */
// biome-ignore lint/style/useNodejsImportProtocol: browser polyfill, not Node.js
import { Buffer } from 'buffer'

Object.defineProperty(globalThis, 'Buffer', { value: Buffer })

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
