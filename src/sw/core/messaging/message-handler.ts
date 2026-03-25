import { Match } from 'effect'
import { getLogEntries, log } from '../../logging/logger'
import { getMetrics } from '../../logging/metrics'
import type { SWRequest } from '../../protocol'
import { buildStatus } from '../../state/build-status'
import { handleFetchMessage } from './handle-fetch-message'
import { handleInit } from './handle-init'
import { handleInvalidate } from './handle-invalidate'

type Reply = (data: unknown) => void

/**
 * Handle an incoming postMessage from the client.
 * @param msg - The message payload
 * @param reply - Callback to send response via MessagePort
 * @returns void
 */
export const handleMessage = (msg: SWRequest, reply: Reply): void =>
  Match.value(msg).pipe(
    Match.when({ type: 'SW_INIT' }, m => handleInit(m.config, reply)),
    Match.when({ type: 'SW_FETCH' }, m => handleFetchMessage(m, reply)),
    Match.when({ type: 'SW_STATUS' }, () => reply(buildStatus())),
    Match.when({ type: 'SW_METRICS' }, () => reply(getMetrics())),
    Match.when({ type: 'SW_LOG_SUBSCRIBE' }, () =>
      reply({ entries: getLogEntries() })
    ),
    Match.when({ type: 'SW_INVALIDATE' }, () => handleInvalidate(reply)),
    Match.orElse(() => log('warn', 'lifecycle', 'Unknown message type'))
  )
